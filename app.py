from flask import Flask, request, jsonify
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from bson import ObjectId
from datetime import datetime
from flask_cors import CORS
from config import MONGO_URI, DB_NAME, COLLECTION_PRODUCTS ,COLLECTION_USERS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from flask_jwt_extended import JWTManager, create_access_token
from flask_jwt_extended import jwt_required, get_jwt_identity

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
app.config["JWT_SECRET_KEY"] = "your-secret-key"
jwt = JWTManager(app)

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection_products = db[COLLECTION_PRODUCTS]
collection_users = db[COLLECTION_USERS]



@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = {
        "username": data['username'],
        "email": data['email'],
        "password": hashed_password
    }
    if db.users.find_one({"email": user['email']}):
        return jsonify({"error": "User already exists"}), 400

    db.users.insert_one(user)
    return jsonify({"message": "User registered successfully"}), 201



@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = db.users.find_one({"email": data['email']})
    if user and bcrypt.check_password_hash(user['password'], data['password']):
        access_token = create_access_token(identity=str(user['_id']))
        return jsonify({
            "access_token": access_token,
            "user": {
                "username": user['username'],
                "email": user['email']
            }
        }), 200
    return jsonify({"error": "Invalid credentials"}), 401




@app.route('/api/products', methods=['POST'])
@jwt_required()
def add_product():
    user_id = get_jwt_identity()
    data = request.get_json()
    required_fields = ['item_name', 'price', 'quantity', 'purchase_date', 'category']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    try:
        product = {
            "item_name": data['item_name'],
            "price": float(data['price']),
            "quantity": int(data['quantity']),
            "purchase_date": datetime.strptime(data['purchase_date'], "%Y-%m-%d"),
            "category": data['category'],
            "user_id": ObjectId(user_id)  # 🔒 Link product to user
        }
        result = collection_products.insert_one(product)
        return jsonify({"message": "Product added", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500




@app.route('/api/products', methods=['GET'])
@jwt_required()
def get_inventory():
    try:
        user_id = get_jwt_identity()
        products = list(collection_products.find({"user_id": ObjectId(user_id)}))  # 👈 Filter by user

        total_value = 0
        for product in products:
            product['_id'] = str(product['_id'])
            product['purchase_date'] = product['purchase_date'].strftime('%Y-%m-%d')
            product['user_id'] = str(product['user_id'])
            total_value += product.get('price', 0) * product.get('quantity', 0)

        return jsonify({
            "products": products,
            "total_value": total_value
        }), 200
    except PyMongoError as e:
        return jsonify({"error": str(e)}), 500

    
# Get a single product by ID
@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = collection_products.find_one({"_id": ObjectId(product_id)})
        if not product:
            return jsonify({"error": "Product not found"}), 404

        product['_id'] = str(product['_id'])
        product['purchase_date'] = product['purchase_date'].strftime('%Y-%m-%d')

        return jsonify(product), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Edit product (update)
@app.route('/api/products/<product_id>', methods=['PUT'])
@jwt_required()
def edit_product(product_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    # Ensure product belongs to user
    product = collection_products.find_one({"_id": ObjectId(product_id), "user_id": ObjectId(user_id)})
    if not product:
        return jsonify({"error": "Unauthorized or product not found"}), 404

    update_fields = {}
    if 'item_name' in data: update_fields['item_name'] = data['item_name']
    if 'price' in data: update_fields['price'] = float(data['price'])
    if 'quantity' in data: update_fields['quantity'] = int(data['quantity'])
    if 'purchase_date' in data:
        update_fields['purchase_date'] = datetime.strptime(data['purchase_date'], "%Y-%m-%d")

    if not update_fields:
        return jsonify({"error": "No valid fields to update"}), 400

    collection_products.update_one({"_id": ObjectId(product_id)}, {"$set": update_fields})
    return jsonify({"message": "Product updated"}), 200


# Delete product
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId

@app.route('/api/products/<product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    try:
        user_id = get_jwt_identity()
        
        result = collection_products.delete_one({
            "_id": ObjectId(product_id),
            "user_id": ObjectId(user_id)
        })

        if result.deleted_count == 1:
            return jsonify({"message": "Product deleted"}), 200
        else:
            return jsonify({"error": "Product not found or unauthorized"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
