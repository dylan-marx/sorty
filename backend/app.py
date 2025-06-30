import json
from flask import Flask, jsonify, request
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
classifications = []

out_csv = None

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

def load_out_csv(out_csv_file_path):
    global out_csv, out_csv_path, csv_data, columns
    
    out_csv_path = out_csv_file_path
    
    try:
        if os.path.exists(out_csv_file_path):
            out_csv = pd.read_csv(out_csv_file_path)
            print(f"Loaded existing output CSV with {len(out_csv)} rows")
        else:
            if csv_data is not None:
                out_csv = pd.DataFrame(columns=columns)
                out_csv['id'] = csv_data['id'].copy()
                for col in columns:
                    if col != 'id':
                        out_csv[col] = None
                
                out_csv.to_csv(out_csv_file_path, index=False)
                print(f"Created new output CSV with {len(out_csv)} rows")
            else:
                print("Cannot create output CSV: no input CSV loaded")
                return False
        return True
    except Exception as e:
        print(f"Error with output CSV: {e}")
        return False

def save_out_csv():
    global out_csv, out_csv_path
    
    try:
        if out_csv is not None and out_csv_path is not None:
            out_csv.to_csv(out_csv_path, index=False)
            return True
        return False
    except Exception as e:
        print(f"Error saving output CSV: {e}")
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


@app.route('/api/classify', methods=['POST'])
def classify_data():
    global out_csv, csv_data
    
    if csv_data is None:
        return jsonify({
            'error': 'No CSV data loaded. Please load a CSV file first.'
        }), 400
    
    if out_csv is None:
        return jsonify({
            'error': 'No output CSV initialized. Please check output CSV configuration.'
        }), 400
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided in request body'
            }), 400

        row_id = data.get('id')
        column_name = data.get('column_name')
        classification_value = data.get('category')
        
        if row_id is None or column_name is None or classification_value is None:
            return jsonify({
                'error': 'Missing required fields: id, column_name, and classification_value are required'
            }), 400

        row_id = str(row_id)

        if column_name not in out_csv.columns:
            return jsonify({
                'error': f'Column "{column_name}" does not exist in output CSV'
            }), 400

        row_mask = out_csv['id'].astype(str) == row_id
        
        if not row_mask.any():
            return jsonify({
                'error': f'No row found with ID "{row_id}"'
            }), 404
        
        out_csv.loc[row_mask, column_name] = classification_value

        if save_out_csv():
            return jsonify({
                'message': 'Classification saved successfully',
                'id': row_id,
                'column_name': column_name,
                'classification_value': classification_value
            })
        else:
            return jsonify({
                'error': 'Failed to save classification to file'
            }), 500
            
    except Exception as e:
        return jsonify({
            'error': f'Error processing classification: {str(e)}'
        }), 500

@app.route('/api/next-cell', methods=['GET'])
def get_next_cell():
    global csv_data, total_rows, columns, out_csv
    
    total_columns = len(columns)
    if csv_data is None:
        return jsonify({
            'error': 'No CSV data loaded. Please load a CSV file first.'
        }), 400
    
    if out_csv is None:
        return jsonify({
            'error': 'No output CSV loaded. Please load output CSV first.'
        }), 400

    def is_cell_classified(row_idx, col_name):
        if col_name == 'id': 
            return True
        
        try:
            row_id = str(csv_data.iloc[row_idx]['id'])
            row_mask = out_csv['id'].astype(str) == row_id
            if row_mask.any():
                cell_value = out_csv.loc[row_mask, col_name].iloc[0]
                return pd.notna(cell_value) and cell_value != '' and cell_value is not None
        except:
            pass
        return False

    for row_idx in range(total_rows):
        for col_idx in range(total_columns):
            column_name = columns[col_idx]

            if not is_cell_classified(row_idx, column_name):
                # Found the first unclassified cell, return it
                row = csv_data.iloc[row_idx]
                
                # Handle NaN values
                value = row[column_name]
                if pd.isna(value):
                    cell_value = None
                else:
                    cell_value = str(value)

                response_data = {
                    'id': str(row['id']),
                    'row_number': row_idx + 1,
                    'column_number': col_idx + 1,
                    'column_name': column_name,
                    'cell_value': cell_value,
                    'total_rows': total_rows,
                    'total_columns': total_columns,
                    'has_more_columns': col_idx + 1 < total_columns,
                    'has_more_rows': row_idx + 1 < total_rows
                }

                return jsonify(response_data)
    
    # If we reach here, all cells are classified
    return jsonify({
        'error': 'No more unclassified data available',
        'message': 'All cells have been classified'
    }), 404
if __name__ == '__main__':
    load_categories()
    default_csv_path = './data/data.csv'
    out_csv_path = './data/classification.csv'
    if os.path.exists(default_csv_path):
        load_csv_data(default_csv_path)
        load_out_csv(out_csv_path)
    
    app.run(debug=True, host='0.0.0.0', port=5000)