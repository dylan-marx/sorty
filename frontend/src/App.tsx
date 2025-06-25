import React, { useState, useCallback, useEffect } from 'react';
import Card from './components/Card';
import './style/App.css';
import CategoryCollection from './components/CategoryCollection';

type DropHandler = (event: MouseEvent) => void;
type DropHandlers = Record<string, DropHandler>;

function App() {
  const [dropHandlers, setDropHandlers] = useState<DropHandlers>({});
  const [apiStatus, setApiStatus] = useState<string>('Checking...');

  const [totalRows, setTotalRows] = useState<number | null>(null);
  const [totalColumns, setTotalColumns] = useState<number | null>(null);
  const [totalEntries, setTotalEntries] = useState<number | null>(null);

  const [categories, setCategories] = useState<string[]>([]);

  // checks if data loaded in csv
  useEffect(() => {
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
  }, [totalRows, totalColumns])

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
    }
  }, [dropHandlers]);

  return (
    <>
      <div className='header'>
        Data Classifier
      </div>
      <div className='flex-container'>
        <div className='category-collection-container'>
          <CategoryCollection categories={categories} registerDropHandler={registerDropHandler} />
        </div>

        <div className='card-container'>
          <Card 
            text='# The Illusion of Progress in Modern Technology
                  Technology advances rapidly—faster processors, smarter AI, thinner phones. But are these truly signs of progress?
                  ## Convenience vs. Dependence
                  While devices make life easier, they also make users dependent. A simple GPS error today can paralyze a driver. Is this empowerment, or a quiet erosion of basic skills?
                  ## Productivity or Distraction?
                  We were promised productivity, yet attention spans are shorter, and constant notifications fragment focus. Technology may streamline tasks, but it also manufactures distractions.
                  ## Who Really Benefits?
                  Progress often favors corporations more than individuals. Data harvesting, planned obsolescence, and algorithmic manipulation suggest users are products, not customers.
                  ## Conclusion
                  The narrative of progress is seductive, but needs scrutiny. Not all innovation is improvement. True progress should enhance autonomy, not undermine it.# The Illusion of Progress in Modern Technology
                  Technology advances rapidly—faster processors, smarter AI, thinner phones. But are these truly signs of progress?'
            onDrop={handleDrop}
          />
        </div>

        <div className='data-stats'>
            <div className='api-status'>Data Status: {apiStatus}</div>
            <div>Rows: {totalRows}</div>

            <div>Columns: {totalColumns}</div>
            <div>Total Entries: {totalEntries}</div>
        </div>

        </div>
    </>
  );
}

export default App;