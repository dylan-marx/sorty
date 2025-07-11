import React, { useState, useCallback, useEffect, useRef } from 'react';
import Card from './components/Card';
import './style/App.css';
import CategoryCollection from './components/CategoryCollection';
import FileSelector from './components/CSVFileUploader';

type DropHandler = (event: MouseEvent) => void;
type DropHandlers = Record<string, DropHandler>;

function App() {
  const [dropHandlers, setDropHandlers] = useState<DropHandlers>({});
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const hasFetchedRef = useRef(false);
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fetchCell = async () => {
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
    }
  };

  useEffect(() => {
    const currentEntryNumber = (Number(rowNumber) - 1) * Number(totalColumns) + Number(columnNumber);
    setCurrentEntry(String(currentEntryNumber-1));
  }, [rowNumber, columnNumber, totalColumns]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    
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

  const handleDrop = useCallback(async (dropTarget: Element, event: MouseEvent) => {
    const categoryText = dropTarget.getAttribute('data-category-text');
    if (categoryText && dropHandlers[categoryText]) {
      try {
        await dropHandlers[categoryText](event);
        await fetchCell();
      } catch (error) {
        console.error('Error in drop handling:', error);
      }
    }
  }, [dropHandlers]);

  return (
    <>
      <div className='header'>
        <span>Sorty</span>
        <button 
          className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>
      
      <div className={`side-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <div className={`side-menu ${isMenuOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="menu-content">
            <h3>Dataset Tools</h3>
            <FileSelector />
            <div className='menu-stats'>
              <div className='api-status'>{apiStatus}</div>
              <div className='stat-item'>
                <span className='stat-label'>Rows:</span>
                <span className='stat-value'>{totalRows || '—'}</span>
              </div>
              <div className='stat-item'>
                <span className='stat-label'>Columns:</span>
                <span className='stat-value'>{totalColumns || '—'}</span>
              </div>
              <div className='stat-item'>
                <span className='stat-label'>Total Entries:</span>
                <span className='stat-value'>{totalEntries || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className='app-container'>
        <div className='main-content'>
          <div className='flex-container'>
            <div className='category-collection-container'>
              <CategoryCollection 
                id={cardID} 
                columnName={columnName} 
                categories={categories} 
                registerDropHandler={registerDropHandler} 
              />
            </div>
            
            <div className='card-area'>
              <div className='card-container'>
                <Card
                  id={cardID}
                  columnName={columnName}
                  text={cardText}
                  onDrop={handleDrop}
                />
              </div>
              
              <div className='progress-container'>
                <progress 
                  className='progress'
                  value={Number(currentEntry) / (totalEntries || 1)}
                />
                <span className='progress-percentage'>
                  {Math.round((Number(currentEntry) / (totalEntries || 1)) * 100)}%
                </span>
              </div>
            </div>
            
            <div className='data-stats'>
              <div className='stat-item'>
                <span className='stat-label'>Current Entry:</span>
                <span className='stat-value'>{currentEntry || '—'}</span>
              </div>
              <div className='stat-item'>
                <span className='stat-label'>Column Name:</span>
                <span className='stat-value'>{columnName || '—'}</span>
              </div>
              <div className='stat-item'>
                <span className='stat-label'>ID:</span>
                <span className='stat-value'>{cardID || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;