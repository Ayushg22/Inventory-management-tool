from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import uuid
from google.cloud import firestore
from google.cloud.firestore_v1 import FieldFilter


# Initialize Flask
app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
app.config["JWT_SECRET_KEY"] = "your-secret-key"
jwt = JWTManager(app)

# Initialize Firestore
cred = credentials.Certificate("nice-height-460409-m5-a7922d570346.json")
firebase_admin.initialize_app(cred)
db = firestore.Client()
collection_products = db.collection('products')
collection_users = db.collection('users')

# ================== USER ROUTES =======================

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user_ref = db.collection('users').where('email', '==', data['email']).get()

    if user_ref:
        return jsonify({"error": "User already exists"}), 400

    user_id = str(uuid.uuid4())
    db.collection('users').document(user_id).set({
        "username": data['username'],
        "email": data['email'],
        "password": hashed_password
    })
    return jsonify({"message": "User registered successfully"}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    users = db.collection('users').where('email', '==', data['email']).get()

    if not users:
        return jsonify({"error": "Invalid credentials"}), 401

    user = users[0].to_dict()
    user_id = users[0].id

    if bcrypt.check_password_hash(user['password'], data['password']):
        access_token = create_access_token(identity=user_id)
        return jsonify({
            "access_token": access_token,
            "user": {
                "username": user['username'],
                "email": user['email']
            }
        }), 200
    return jsonify({"error": "Invalid credentials"}), 401

# ================== PRODUCT ROUTES =======================

@app.route('/api/products', methods=['POST'])
@jwt_required()
def add_product():
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        product_id = str(uuid.uuid4())
        db.collection('products').document(product_id).set({
            "item_name": data['item_name'],
            "price": float(data['price']),
            "quantity": int(data['quantity']),
            "purchase_date": data['purchase_date'],
            "category": data['category'],
            "user_id": user_id
        })
        return jsonify({"message": "Product added", "id": product_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/products', methods=['GET'])
@jwt_required()
def get_inventory():
    try:
        user_id = get_jwt_identity()
        print(f"[DEBUG] Fetching products for user: {user_id}")  # 👈 Add this line

        products = collection_products.where(filter=FieldFilter("user_id", "==", user_id)).stream()
        product_list = []
        total_value = 0

        for product in products:
            product_data = product.to_dict()
            product_data['id'] = product.id
            product_list.append(product_data)

            total_value += float(product_data.get('price', 0)) * int(product_data.get('quantity', 0))

        return jsonify({
            "products": product_list,
            "total_value": total_value
        }), 200

    except Exception as e:
        print(f"[ERROR] {str(e)}")  # 👈 Log the error
        return jsonify({"error": str(e)}), 500



@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    try:
        doc = db.collection('products').document(product_id).get()
        if doc.exists:
            product = doc.to_dict()
            product['id'] = doc.id
            return jsonify(product), 200
        else:
            return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/products/<product_id>', methods=['PUT'])
@jwt_required()
def edit_product(product_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    doc = db.collection('products').document(product_id).get()
    if not doc.exists or doc.to_dict().get("user_id") != user_id:
        return jsonify({"error": "Unauthorized or product not found"}), 404

    try:
        db.collection('products').document(product_id).update(data)
        return jsonify({"message": "Product updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/products/<product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    user_id = get_jwt_identity()
    doc = db.collection('products').document(product_id).get()
    if not doc.exists or doc.to_dict().get("user_id") != user_id:
        return jsonify({"error": "Product not found or unauthorized"}), 404

    try:
        db.collection('products').document(product_id).delete()
        return jsonify({"message": "Product deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
