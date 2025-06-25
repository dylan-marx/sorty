import json
from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

current_row_index = 0
current_column_index = 1
csv_data = None
total_rows = 0
columns = []
categories = []

def load_categories():
    global categories
    try:
        with open('config.json', 'r') as file:
            data = json.load(file)
        
        categories = data
        print(data['categories'])
        return True
    except Exception as e:
        return False

def load_csv_data(csv_file_path):
    global csv_data, total_rows, current_row_index, columns
    
    try:
        csv_data = pd.read_csv(csv_file_path)
        total_rows = len(csv_data)
        current_row_index = 0
        columns = csv_data.columns.tolist()
        print(f"Loaded CSV with {total_rows} rows and columns: {columns}")
        return True
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return False
    

@app.route('/api/get-categories', methods=['GET'])
def get_categories():
    global categories
    
    if categories is None:
        return jsonify({
            'error': 'No categories found. Please load a config.json file'
        }), 400
    
    return jsonify(categories)
    

@app.route('/api/next-row', methods=['GET'])
def get_next_row():
    global current_row_index, csv_data, total_rows, columns
    
    if csv_data is None:
        return jsonify({
            'error': 'No CSV data loaded. Please load a CSV file first.'
        }), 400
    
    if current_row_index >= total_rows:
        return jsonify({
            'error': 'No more rows available',
            'message': 'All rows have been served'
        }), 404

    row = csv_data.iloc[current_row_index]

    row_data = {}
    for column in columns:
        # Handle NaN values
        value = row[column]
        if pd.isna(value):
            row_data[column] = None
        else:
            row_data[column] = str(value)

    response_data = {
        'row_number': current_row_index + 1,
        'total_rows': total_rows,
        'columns': columns,
        'data': row_data,
        'has_more': current_row_index + 1 < total_rows
    }

    current_row_index += 1
    
    return jsonify(response_data)

@app.route('/api/columns', methods=['GET'])
def get_columns():
    global columns, csv_data
    
    if csv_data is None:
        return jsonify({
            'error': 'No CSV data loaded. Please load a CSV file first.'
        }), 400
    
    return jsonify({
        'columns': columns,
        'total_columns': len(columns)
    })
        
@app.route('/api/status', methods=['GET'])
def get_status():
    global current_row_index, total_rows, csv_data, columns
    
    return jsonify({
        'csv_loaded': csv_data is not None,
        'current_row': current_row_index + 1 if csv_data is not None else 0,
        'total_rows': total_rows,
        'rows_remaining': total_rows - current_row_index if csv_data is not None else 0,
        'columns': columns if csv_data is not None else [],
        'total_columns': len(columns) if csv_data is not None else 0
    })

@app.route('/api/next-cell', methods=['GET'])
def get_next_cell():
    global current_row_index, current_column_index, csv_data, total_rows, total_columns, columns
    
    total_columns = len(columns)
    if csv_data is None:
        return jsonify({
            'error': 'No CSV data loaded. Please load a CSV file first.'
        }), 400
    
    if current_row_index >= total_rows:
        return jsonify({
            'error': 'No more data available',
            'message': 'All cells have been served'
        }), 404


    row = csv_data.iloc[current_row_index]
    column_name = columns[current_column_index]
    
    
    # Handle NaN values
    value = row[column_name]
    if pd.isna(value):
        cell_value = None
    else:
        cell_value = str(value)

    
    response_data = {
        'id': str(row['id']),
        'row_number': current_row_index + 1,
        'column_number': current_column_index + 1,
        'column_name': column_name,
        'cell_value': cell_value,
        'total_rows': total_rows,
        'total_columns': total_columns,
        'has_more_columns': current_column_index + 1 < total_columns,
        'has_more_rows': current_row_index + 1 < total_rows
    }

    if current_column_index + 1 < total_columns:
        current_column_index += 1
    else:
        current_row_index += 1
        current_column_index = 1
    
    return jsonify(response_data)

if __name__ == '__main__':
    load_categories()
    default_csv_path = './data/data.csv'
    if os.path.exists(default_csv_path):
        load_csv_data(default_csv_path)
    
    app.run(debug=True, host='0.0.0.0', port=5000)