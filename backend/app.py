from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

current_row_index = 0
csv_data = None
total_rows = 0
columns = []

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

if __name__ == '__main__':
    default_csv_path = './data/data.csv'
    if os.path.exists(default_csv_path):
        load_csv_data(default_csv_path)
    
    app.run(debug=True, host='0.0.0.0', port=5000)