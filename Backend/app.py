import os
import logging
import uuid
from datetime import timedelta, datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
import firebase_admin
from firebase_admin import credentials, firestore
from flask_caching import Cache

# ---------------- CONFIG ---------------- #
load_dotenv()

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# Flask app
app = Flask(__name__)

# ---------------- CORS ---------------- #
origins_env = os.getenv("CORS_ORIGINS", "")
if origins_env:
    origins = [o.strip().rstrip("/") for o in origins_env.split(",") if o.strip()]
else:
    origins = [
        "http://localhost:3000",
        "https://nice-height-460409-m5.web.app"
    ]

CORS(app, resources={r"/api/*": {"origins": origins}}, supports_credentials=True)
logger.info(f"CORS origins: {origins}")

# ---------------- JWT & Bcrypt ---------------- #
jwt_secret = os.getenv("JWT_SECRET_KEY", "dev-secret")
app.config["JWT_SECRET_KEY"] = jwt_secret
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=int(os.getenv("JWT_ACCESS_MINUTES", 30)))
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", 7)))

jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# ---------------- Cache ---------------- #
redis_url = os.getenv("REDIS_URL")
cache_config = {
    "CACHE_TYPE": "RedisCache" if redis_url else "SimpleCache",
    "CACHE_REDIS_URL": redis_url if redis_url else None,
    "CACHE_DEFAULT_TIMEOUT": int(os.getenv("CACHE_DEFAULT_TIMEOUT", 300))
}
cache = Cache(config=cache_config)
cache.init_app(app)
logger.info(f"Using cache type: {cache_config['CACHE_TYPE']}")

# ---------------- Firebase ---------------- #
try:
    sa_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if sa_path:
        cred = credentials.Certificate(sa_path)
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
    else:
        if not firebase_admin._apps:
            firebase_admin.initialize_app()
    db = firestore.client()
    collection_users = db.collection("users")
    collection_products = db.collection("products")
    collection_sales = db.collection("sales")
except Exception:
    logger.exception("Failed to initialize Firebase")
    raise

# ---------------- Helpers ---------------- #
def require_json():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    return None

# ---------------- AUTH ROUTES ---------------- #
@app.route('/api/register', methods=['POST'])
def register():
    try:
        err = require_json()
        if err:
            return err
        data = request.get_json()
        if not data.get("username") or not data.get("email") or not data.get("password"):
            return jsonify({"error": "username, email, and password required"}), 400

        if collection_users.where("email", "==", data["email"]).get():
            return jsonify({"error": "User already exists"}), 400

        hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
        user_id = str(uuid.uuid4())
        collection_users.document(user_id).set({
            "username": data["username"],
            "email": data["email"],
            "password": hashed_password
        })
        return jsonify({"message": "User registered successfully"}), 201
    except Exception:
        logger.exception("ERROR in register")
        return jsonify({"error": "Server error"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        err = require_json()
        if err:
            return err
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        if not email or not password:
            return jsonify({"error": "email and password required"}), 400

        users = collection_users.where("email", "==", email).get()
        if not users:
            return jsonify({"error": "User does not exist", "redirect": "/register"}), 404

        user_doc = users[0]
        user = user_doc.to_dict()
        user_id = user_doc.id

        if bcrypt.check_password_hash(user["password"], password):
            access_token = create_access_token(identity=user_id)
            refresh_token = create_refresh_token(identity=user_id)
            return jsonify({
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": {"username": user["username"], "email": user["email"]}
            }), 200

        return jsonify({"error": "Invalid credentials"}), 401
    except Exception:
        logger.exception("ERROR in login")
        return jsonify({"error": "Server error"}), 500

# ---------------- PROFILE ROUTES ---------------- #
@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        profile_ref = collection_users.document(user_id).collection("profile").document("business")
        profile = profile_ref.get()
        if profile.exists:
            return jsonify(profile.to_dict()), 200
        return jsonify({"message": "No profile found"}), 404
    except Exception:
        logger.exception("ERROR in get_profile")
        return jsonify({"error": "Server error"}), 500

@app.route('/api/profile', methods=['POST', 'PUT'])
@jwt_required()
def create_or_update_profile():
    try:
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}
        allowed_fields = ["business_name", "gst_number", "annual_turnover", "owner_name"]
        updates = {field: data[field] for field in allowed_fields if field in data}
        if not updates:
            return jsonify({"msg": "No valid fields to update"}), 400

        profile_ref = collection_users.document(user_id).collection("profile").document("business")
        profile_ref.set(updates, merge=True)
        cache.delete(f"profile_{user_id}")
        return jsonify({"msg": "Profile updated successfully", "profile": updates}), 200
    except Exception:
        logger.exception("ERROR in create_or_update_profile")
        return jsonify({"error": "Server error"}), 500

# ---------------- REFRESH ROUTE ---------------- #
@app.route("/api/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    try:
        user_id = get_jwt_identity()
        new_access_token = create_access_token(identity=user_id)
        return jsonify({"access_token": new_access_token}), 200
    except Exception:
        logger.exception("ERROR in refresh")
        return jsonify({"error": "Server error"}), 500

# ---------------- RUN ---------------- #


# ---------------- PRODUCTS ROUTES ---------------- #
@app.route('/api/products', methods=['POST'])
@jwt_required()
def add_product():
    try:
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}
        required = ["item_name", "buy_price", "selling_price", "quantity", "purchase_date", "category"]
        if not all(k in data for k in required):
            return jsonify({"error": "Missing product fields"}), 400

        product_id = str(uuid.uuid4())
        collection_products.document(product_id).set({
            "item_name": data['item_name'],
            "buy_price": float(data['buy_price']),
            "selling_price": float(data['selling_price']),
            "quantity": int(data['quantity']),
            "purchase_date": data['purchase_date'],
            "category": data['category'],
            "user_id": user_id
        })
        cache.delete(f"products_{user_id}")
        return jsonify({"message": "Product added", "id": product_id}), 201
    except Exception:
        logger.exception("ERROR in add_product")
        return jsonify({"error": "Server error"}), 500

@app.route('/api/products', methods=['GET'])
@jwt_required()
def get_inventory():
    try:
        user_id = get_jwt_identity()
        cache_key = f"products_{user_id}"
        cached = cache.get(cache_key)
        if cached:
            return jsonify(cached), 200

        products_stream = collection_products.where("user_id", "==", user_id).stream()
        product_list = []
        total_value = 0
        for product in products_stream:
            p = product.to_dict()
            p['id'] = product.id
            product_list.append(p)
            total_value += float(p.get('buy_price', 0)) * int(p.get('quantity', 0))

        result = {"products": product_list, "total_value": total_value}
        cache.set(cache_key, result)
        return jsonify(result), 200
    except Exception:
        logger.exception("ERROR in get_inventory")
        return jsonify({"error": "Server error"}), 500

@app.route('/api/products/<product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    try:
        user_id = get_jwt_identity()
        cache_key = f"product_{product_id}_{user_id}"
        cached = cache.get(cache_key)
        if cached:
            return jsonify(cached), 200

        product_doc = collection_products.document(product_id).get()
        if not product_doc.exists:
            return jsonify({"error": "Product not found"}), 404

        product_data = product_doc.to_dict()
        if product_data.get("user_id") != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        result = {"id": product_doc.id, **product_data}
        cache.set(cache_key, result)
        return jsonify(result), 200
    except Exception:
        logger.exception("ERROR in get_product")
        return jsonify({"error": "Server error"}), 500

@app.route("/api/products/<product_id>", methods=["PUT"])
@jwt_required()
def update_product(product_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}
        product_doc_ref = collection_products.document(product_id)
        product_doc = product_doc_ref.get()
        if not product_doc.exists:
            return jsonify({"error": "Product not found"}), 404
        product = product_doc.to_dict()
        if product.get("user_id") != user_id:
            return jsonify({"error": "Unauthorized access"}), 403

        allowed_fields = ["item_name", "buy_price", "selling_price", "quantity", "purchase_date", "category"]
        updates = {}
        for field in allowed_fields:
            if field in data:
                if field in ["buy_price", "selling_price"]:
                    updates[field] = float(data[field])
                elif field == "quantity":
                    updates[field] = int(data[field])
                else:
                    updates[field] = data[field]

        if not updates:
            return jsonify({"error": "No valid fields provided"}), 400

        product_doc_ref.update(updates)
        cache.delete(f"products_{user_id}")
        cache.delete(f"product_{product_id}_{user_id}")
        return jsonify({"message": "Product updated successfully", "updates": updates}), 200
    except Exception:
        logger.exception("ERROR in update_product")
        return jsonify({"error": "Server error"}), 500

@app.route("/api/products/<product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    try:
        user_id = get_jwt_identity()
        product_doc = collection_products.document(product_id).get()
        if not product_doc.exists:
            return jsonify({"error": "Product not found"}), 404
        product = product_doc.to_dict()
        if product.get("user_id") != user_id:
            return jsonify({"error": "Unauthorized access"}), 403

        collection_products.document(product_id).delete()
        cache.delete(f"products_{user_id}")
        cache.delete(f"product_{product_id}_{user_id}")
        return jsonify({"message": "Product deleted successfully"}), 200
    except Exception:
        logger.exception("ERROR in delete_product")
        return jsonify({"error": "Server error"}), 500

# ---------------- SALES ROUTES ---------------- #
@app.route("/api/sales", methods=["POST"])
@jwt_required()
def record_sale():
    try:
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}
        items = data.get("items", [])
        if not items:
            return jsonify({"error": "No items provided"}), 400

        total_amount = 0
        total_profit = 0
        sale_items = []

        # Use transaction if you want atomicity (optional enhancement)
        for item in items:
            product_id = item.get("product_id")
            quantity_sold = int(item.get("quantity_sold", 0))
            if not product_id or quantity_sold <= 0:
                return jsonify({"error": "Invalid product or quantity"}), 400

            product_ref = collection_products.document(product_id)
            product_doc = product_ref.get()
            if not product_doc.exists:
                return jsonify({"error": f"Product {product_id} not found"}), 404
            product = product_doc.to_dict()
            if product.get("user_id") != user_id:
                return jsonify({"error": "Unauthorized access to product"}), 403
            if int(product.get("quantity", 0)) < quantity_sold:
                return jsonify({"error": f"Not enough stock for {product.get('item_name', 'Unknown')}"}), 400

            # Update product quantity
            product_ref.update({"quantity": int(product.get("quantity", 0)) - quantity_sold})
            cache.delete(f"products_{user_id}")
            cache.delete(f"product_{product_id}_{user_id}")

            selling_price = float(product.get("selling_price", 0))
            buy_price = float(product.get("buy_price", 0))
            amount = selling_price * quantity_sold
            profit = (selling_price - buy_price) * quantity_sold

            sale_items.append({
                "product_id": product_id,
                "item_name": product.get("item_name"),
                "buy_price": buy_price,
                "selling_price": selling_price,
                "quantity_sold": quantity_sold,
                "amount": amount,
                "profit": profit
            })

            total_amount += amount
            total_profit += profit

        sale_id = str(uuid.uuid4())
        sale_date = datetime.utcnow().strftime("%Y-%m-%d")
        collection_sales.document(sale_id).set({
            "user_id": user_id,
            "date": sale_date,
            "items": sale_items,
            "total_amount": total_amount,
            "total_profit": total_profit
        })
        cache.delete(f"sales_summary_{user_id}")
        return jsonify({
            "message": "Sale recorded successfully",
            "sale_id": sale_id,
            "total_amount": total_amount,
            "total_profit": total_profit,
            "items": sale_items
        }), 201
    except Exception:
        logger.exception("ERROR in record_sale")
        return jsonify({"error": "Server error"}), 500

@app.route("/api/sales", methods=["GET"])
@jwt_required()
def get_sales():
    try:
        user_id = get_jwt_identity()
        cache_key = f"sales_{user_id}"
        cached_sales = cache.get(cache_key)
        if cached_sales:
            return jsonify({"sales": cached_sales}), 200

        sales_docs = collection_sales.where("user_id", "==", user_id).stream()
        sales_list = []
        for doc in sales_docs:
            sale = doc.to_dict()
            sales_list.append({
                "id": doc.id,
                "date": sale.get("date"),
                "items": sale.get("items", []),
                "total_amount": sale.get("total_amount", 0),
                "total_profit": sale.get("total_profit", 0)
            })

        cache.set(cache_key, sales_list)
        return jsonify({"sales": sales_list}), 200
    except Exception:
        logger.exception("ERROR in get_sales")
        return jsonify({"error": "Server error"}), 500

@app.route("/api/sales/summary", methods=["GET"])
@jwt_required()
def get_sales_summary():
    try:
        user_id = get_jwt_identity()
        cache_key = f"sales_summary_{user_id}"
        cached = cache.get(cache_key)
        if cached:
            return jsonify(cached), 200

        today = datetime.utcnow().date()
        thirty_days_ago = today - timedelta(days=30)

        sales_docs = collection_sales.where("user_id", "==", user_id).stream()
        daily_summary = {}
        product_summary = {}

        for sale in sales_docs:
            data = sale.to_dict()
            date = data.get("date")
            items = data.get("items", [])
            total_amount = data.get("total_amount", 0)
            total_profit = data.get("total_profit", 0)

            if date not in daily_summary:
                daily_summary[date] = {"sales": 0, "profit": 0, "total_items": 0}
            daily_summary[date]["sales"] += total_amount
            daily_summary[date]["profit"] += total_profit
            daily_summary[date]["total_items"] += sum(item.get("quantity_sold", 0) for item in items)

            for item in items:
                name = item.get("item_name") or "Unknown"
                quantity = item.get("quantity_sold", 0)
                profit = item.get("profit", 0)
                if name not in product_summary:
                    product_summary[name] = {"quantity": 0, "profit": 0}
                product_summary[name]["quantity"] += quantity
                product_summary[name]["profit"] += profit

        daily_sales = [
            {"date": d, "sales": vals["sales"], "profit": vals["profit"], "total_items": vals["total_items"]}
            for d, vals in daily_summary.items()
        ]
        daily_sales.sort(key=lambda x: x["date"])

        top_products = [
            {"name": name, "quantity": vals["quantity"], "profit": vals["profit"]}
            for name, vals in product_summary.items()
        ]
        top_products.sort(key=lambda x: x["quantity"], reverse=True)

        result = {"dailySales": daily_sales, "topProducts": top_products}
        cache.set(cache_key, result)
        return jsonify(result), 200
    except Exception:
        logger.exception("ERROR in get_sales_summary")
        return jsonify({"error": "Server error"}), 500

@app.get("/health")
def health():
    return {"status": "ok"}, 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 8080)))