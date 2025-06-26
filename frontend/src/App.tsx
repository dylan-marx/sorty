import React, { useState, useCallback, useEffect, useRef } from 'react';
import Card from './components/Card';
import './style/App.css';
import CategoryCollection from './components/CategoryCollection';

type DropHandler = (event: MouseEvent) => void;
type DropHandlers = Record<string, DropHandler>;

function App() {
  const [dropHandlers, setDropHandlers] = useState<DropHandlers>({});
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false); // Add this to prevent concurrent calls
  const [totalRows, setTotalRows] = useState<number | null>(null);
  const [totalColumns, setTotalColumns] = useState<number | null>(null);
  const [totalEntries, setTotalEntries] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [cardID, setCardID] = useState<string>('');
  const [columnName, setColumnName] = useState<string>('');
  const [columnNumber, setColumnNumber] = useState<string>('');
  const [rowNumber, setRowNumber] = useState<string>('');
  const [currentEntry, setCurrentEntry] = useState<string>('');
  const [cardText, setCardText] = useState<string>('');

  const fetchCell = async () => {
    // Prevent concurrent calls
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }
    
    isFetchingRef.current = true;
    
    try {
      let data;
      do {
        const res = await fetch('http://localhost:5000/api/next-cell');
        data = await res.json();
        console.log('Fetched cell:', data);
      } while (data.column_name === 'id'); // Skip id columns
      
      setCardID(data.id);
      setColumnName(data.column_name);
      setCardText(data.cell_value);
      setColumnNumber(data.column_number);
      setRowNumber(data.row_number);
    } catch (error) {
      console.error('Error fetching cell:', error);
    } finally {
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {

    const currentEntryNumber = (Number(rowNumber) - 1) * Number(totalColumns) + Number(columnNumber);
    setCurrentEntry(String(currentEntryNumber-1));
    console.log('Current entry:', currentEntryNumber);
  }, [rowNumber, columnNumber, totalColumns])

  useEffect(() => {
    if (hasFetchedRef.current) return; // Prevent multiple calls
    
    fetch('http://localhost:5000/api/status')
      .then((res) => {
        if (!res.ok) throw new Error('Server Error');
        return res.json();
      })
      .then((data) => {
        if (data.total_rows !== undefined && data.total_columns !== undefined) {
          setTotalRows(data.total_rows);
          setTotalColumns(data.total_columns - 1);
          setApiStatus('Data Found');
          fetchCell();
          hasFetchedRef.current = true;
        } else {
          setApiStatus('Unexpected data format');
        }
      })
      .catch(() => setApiStatus('Data Not Found'));
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/get-categories')
      .then((res) => {
        if (!res.ok) throw new Error('Server Error');
        return res.json();
      })
      .then((data) => {
        if (data.categories !== null) {
          setCategories(data.categories);
        }
      })
      .catch(() => setApiStatus('Categories Not Found'));
  }, []);

  useEffect(() => {
    if (totalRows !== null && totalColumns !== null) {
      setTotalEntries(totalRows * totalColumns);
    } else {
      setTotalEntries(null);
    }
  }, [totalRows, totalColumns]);

  const registerDropHandler = useCallback((text: string, handler: DropHandler) => {
    setDropHandlers(prev => ({
      ...prev,
      [text]: handler
    }));
  }, []);

  const handleDrop = useCallback((dropTarget: Element, event: MouseEvent) => {
    // Find which category was dropped on
    const categoryText = dropTarget.getAttribute('data-category-text');
    if (categoryText && dropHandlers[categoryText]) {
      dropHandlers[categoryText](event);
      fetchCell();
    }
  }, [dropHandlers]);

  return (
    <>
      <div className='header'>
        Data Classifier
        col: {columnName}
        id: {cardID}
      </div>
      <div className='flex-container'>
        <div className='category-collection-container'>
          <CategoryCollection id={cardID} columnName={columnName} categories={categories} registerDropHandler={registerDropHandler} />
        </div>
        <div className='card-container'>
          <Card
            text={cardText}
            onDrop={handleDrop}
          />
        </div>
        <div className='data-stats'>
          <div className='api-status'>Data Status: {apiStatus}</div>
          <div>Rows: {totalRows}</div>
          <div>Columns: {totalColumns}</div>
          <div>Total Entries: {totalEntries}</div>
          <div>Curret Entry: {currentEntry}</div>
        </div>
        
      </div>
      <progress value={Number(currentEntry) / (totalEntries || 1)} />
    </>
  );
}

export default App;