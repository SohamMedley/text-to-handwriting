# app.py:
from flask import Flask, render_template, request, jsonify
import os
from werkzeug.utils import secure_filename
import base64
from io import BytesIO  # Import BytesIO

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
app.config['ALLOWED_EXTENSIONS'] = {'ttf', 'otf', 'woff', 'woff2', 'jpg', 'jpeg', 'png'}

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload-font', methods=['POST'])
def upload_font():
    if 'font' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['font']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        # Construct the URL using url_for
        font_url = os.path.join("static/uploads", filename)
        return jsonify({'success': True, 'filename': filename, 'path': font_url}), 200 # Return 200 OK
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/upload-paper', methods=['POST'])
def upload_paper():
    if 'paper' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['paper']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        paper_url = os.path.join("static/uploads", filename)
        return jsonify({'success': True, 'filename': filename, 'path': paper_url}), 200 # Return 200 OK
    return jsonify({'error': 'File type not allowed'}), 400

#  Add this for render.com
wsgi_app = app
if __name__ == '__main__':
    app.run(debug=True)
