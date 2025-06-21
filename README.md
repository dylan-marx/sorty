# data classification
---
## 📝 Project Spec

### 🔧 **Stack**

* **Frontend**: HTML, CSS, TypeScript
* **Backend**: Flask (Python)
* **Data**: CSVs handled with Pandas

---

## Objective

Create a web-based UI to classify text-based cards into one of 5 (configurable) categories using a **radial gesture menu**. Card data is loaded from CSV files and user classifications are written back into category-specific CSVs.

---

## Frontend

### 1. **UI Layout**

* **Card**: Centered on screen, displays one item of text (from CSV row).
* **Radial Menu**:

  * Triggered by press-and-hold on card.
  * 5 category icons/labels appear around the card (evenly spaced in a circle).
  * Dragging the card toward a category icon highlights it.
* **Optional Controls**:

  * Undo last action
  * Reset session
  * Show progress (# classified / total)

---

### 2. **Interaction Logic**

* **Tap**: Just selects card text (does nothing).

* **Hold (500ms)**: Displays radial menu.

* **Drag + Release**:

  * Highlights selected category
  * Animates card off-screen
  * Sends classification to backend

* **Hotkeys**:
  Optional support for keys 1–5 to trigger category assignment without gesture.

---

### 3. **Configuration**

* Categories should be defined in a **JSON config** file (loaded at runtime), e.g.:

```json
{
  "categories": ["Positive", "Negative", "Neutral", "Question", "Off-topic"]
}
```

---

## 🔁 Backend (Flask + Pandas)

### 1. **Endpoints**

* `GET /next`:

  * Returns next unclassified item from master CSV.

* `POST /classify`:

  * Payload:

    ```json
    {
      "item_id": 42,
      "category": "Positive"
    }
    ```
  * Saves the item into the correct category CSV.

* `GET /config`:

  * Returns category names from config file.

* `GET /progress`:

  * Returns count of total vs. classified items.

---

### 2. **CSV Structure**

* **master.csv**:

  * Contains all unclassified items, e.g.

    | id | text            |
    | -- | --------------- |
    | 1  | "Great product" |

* **classification.csv**

    * Contains the id and the category

        | id | category           |
        | -- | --------------- |
        | 1  | "Positive" |

---

## 📦 File Structure (simplified)

```
data_classification/
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.ts
│
├── backend/
│   ├── app.py
│   ├── config.json
│   └── data/
│       ├── master.csv
│       └── category.csv
```

---

## ✅ MVP Checklist

* [ ] Radial UI with gesture-based category selection
* [ ] Configurable category names
* [ ] CSV reading/writing via Flask endpoints
* [ ] Keyboard shortcuts for categories
* [ ] Progress tracking and undo

---