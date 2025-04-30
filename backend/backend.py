from flask import Flask, jsonify, request, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import sqlite3


DATABASE = 'todolist.db'

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
app.config.from_object(__name__)

sessions = {} 

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    hashed = generate_password_hash(password)
    conn = sqlite3.connect('todolist.db')
    cursor = conn.cursor()

    try:
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed))
        conn.commit()

        # Immediately log them in
        token = str(uuid.uuid4())
        sessions[token] = username
        return jsonify({'token': token, 'username': username}), 201

    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 409
    finally:
        conn.close()


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = sqlite3.connect('todolist.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, password FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    
    print(f"LOGIN ATTEMPT: {username}")
    if user:
        print(f"STORED HASH: {user[1]}")
        print(f"PASSWORD MATCH: {check_password_hash(user[1], password)}")
    else:
        print("User not found")

    if user and check_password_hash(user[1], password):
        token = str(uuid.uuid4())
        sessions[token] = username
        return jsonify({'token': token, 'username': username}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

def get_user_id_from_token(token):
    username = sessions.get(token)
    if not username:
        return None

    conn = sqlite3.connect('todolist.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()

    return user[0] if user else None


def get_db():
    """Opens a new database connection if there is none yet for the current application context."""
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = sqlite3.connect(app.config['DATABASE'])
        g.sqlite_db.row_factory = sqlite3.Row
    return g.sqlite_db


@app.teardown_appcontext
def close_db(error):
    """Closes the database connection at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()


@app.route('/api/items', methods=['GET'])
def get_items():
    token = request.headers.get('Authorization')
    user_id = get_user_id_from_token(token)
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = sqlite3.connect('todolist.db')
    cursor = conn.cursor()
    cursor.execute("SELECT what_to_do, due_date, status FROM entries WHERE user_id = ?", (user_id,))
    rows = cursor.fetchall()
    conn.close()

    items = [{'what_to_do': row[0], 'due_date': row[1], 'status': row[2]} for row in rows]
    return jsonify(items)


@app.route('/api/add', methods=['POST'])
def add_item():
    token = request.headers.get('Authorization')
    user_id = get_user_id_from_token(token)
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    what_to_do = data.get('what_to_do')
    due_date = data.get('due_date')

    if not what_to_do or not due_date:
        return jsonify({'error': 'Missing fields'}), 400

    conn = sqlite3.connect('todolist.db')
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO entries (what_to_do, due_date, status, user_id) VALUES (?, ?, 'todo', ?)",
        (what_to_do, due_date, user_id)
    )
    conn.commit()
    conn.close()

    return jsonify({'message': 'Item added successfully'}), 201


@app.route('/api/delete/<what_to_do>', methods=['DELETE'])
def delete_item(what_to_do):
    token = request.headers.get('Authorization')
    user_id = get_user_id_from_token(token)
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = sqlite3.connect('todolist.db')
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM entries WHERE what_to_do = ? AND user_id = ?",
        (what_to_do, user_id)
    )
    conn.commit()
    conn.close()

    return jsonify({'message': f'Deleted \"{what_to_do}\"'}), 200



@app.route('/api/mark_done/<what_to_do>', methods=['PUT'])
def mark_done(what_to_do):
    token = request.headers.get('Authorization')
    user_id = get_user_id_from_token(token)
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = sqlite3.connect('todolist.db')
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE entries SET status = 'done' WHERE what_to_do = ? AND user_id = ?",
        (what_to_do, user_id)
    )
    conn.commit()
    conn.close()

    return jsonify({'message': f'Marked \"{what_to_do}\" as done'}), 200


if __name__ == "__main__":
    app.run("0.0.0.0", port=5001, debug=True)
