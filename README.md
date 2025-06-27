# data classification
---
## 📝 Project Spec

### 🔧 **Stack**

* **Frontend**: HTML, CSS, TypeScript
* **Backend**: Flask (Python)
* **Data**: CSVs handled with Pandas

---

## Objective

Create a web-based UI to classify text-based cards into categories. Card data is loaded from CSV files and user classifications are written back into output CSV.

---

## Installation

To install the project run the following command.

```bash
# Clone the repo
git clone https://github.com/your-username/project-name.git
cd project-name
```
Navigate to the `backend` directory and run the following command.

```bash
# Run backend serving up input CSV and writing to output CSV
python app.py
```

Navigate to the `frontend`, then run the following commands.

```bash
# Install dependencies
npm install

# Start UI
npm start
```
---

### Configuration

* Categories should be defined in a **config.json** file (loaded at runtime), e.g.:

```json
{
  "categories": ["Positive", "Negative", "Neutral", "Question", "Off-topic"]
}
```

* Add the data you wish to label in the **data** folder and name it **data.csv**

---

###  **CSV Structure**

* **data.csv**:

  * Contains all unclassified items, e.g.

    | id | text            |
    | -- | --------------- |
    | 1  | "Great product" |

* **classification.csv**

    * Contains the id and the category

        | id | category           |
        | -- | --------------- |
        | 1  | "Positive" |


## ✅ To do

- Add Keyboard short cuts to further streamline
- Add Undo/Skip
---