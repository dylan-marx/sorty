import React, { useState, useCallback } from 'react';
import Card from './components/Card';
import './style/App.css';
import CategoryCollection from './components/CategoryCollection';

type DropHandler = (event: MouseEvent) => void;
type DropHandlers = Record<string, DropHandler>;

function App() {
  const [dropHandlers, setDropHandlers] = useState<DropHandlers>({});

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
      <div className='header'>Data Classifier</div>
      <div className='flex-container'>
        <div className='category-collection-container'>
          <CategoryCollection registerDropHandler={registerDropHandler} />
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
                  Technology advances rapidly—faster processors, smarter AI, thinner phones. But are these truly signs of progress?
                  ## Convenience vs. Dependence
                  While devices make life easier, they also make users dependent. A simple GPS error today can paralyze a driver. Is this empowerment, or a quiet erosion of basic skills?
                  ## Productivity or Distraction?
                  We were promised productivity, yet attention spans are shorter, and constant notifications fragment focus. Technology may streamline tasks, but it also manufactures distractions.
                  ## Who Really Benefits?
                  Progress often favors corporations more than individuals. Data harvesting, planned obsolescence, and algorithmic manipulation suggest users are products, not customers.
                  ## Conclusion
                  The narrative of progress is seductive, but needs scrutiny. Not all innovation is improvemen# The Illusion of Progress in Modern Technology
                  Technology advances rapidly—faster processors, smarter AI, thinner phones. But are these truly signs of progress?
                  ## Convenience vs. Dependence
                  While devices make life easier, they also make users dependent. A simple GPS error today can paralyze a driver. Is this empowerment, or a quiet erosion of basic skills?
                  ## Productivity or Distraction?
                  We were promised productivity, yet attention spans are shorter, and constant notifications fragment focus. Technology may streamline tasks, but it also manufactures distractions.
                  ## Who Really Benefits?
                  Progress often favors corporations more than individuals. Data harvesting, planned obsolescence, and algorithmic manipulation suggest users are products, not customers.
                  ## Conclusion
                  The narrative of progress is seductive, but needs scrutiny. Not all innovation is improvemen# The Illusion of Progress in Modern Technology
                  Technology advances rapidly—faster processors, smarter AI, thinner phones. But are these truly signs of progress?
                  ## Convenience vs. Dependence
                  While devices make life easier, they also make users dependent. A simple GPS error today can paralyze a driver. Is this empowerment, or a quiet erosion of basic skills?
                  ## Productivity or Distraction?
                  We were promised productivity, yet attention spans are shorter, and constant notifications fragment focus. Technology may streamline tasks, but it also manufactures distractions.
                  ## Who Really Benefits?
                  Progress often favors corporations more than individuals. Data harvesting, planned obsolescence, and algorithmic manipulation suggest users are products, not customers.
                  ## Conclusion
                  The narrative of progress is seductive, but needs scrutiny. Not all innovation is improvemen# The Illusion of Progress in Modern Technology
                  Technology advances rapidly—faster processors, smarter AI, thinner phones. But are these truly signs of progress?
                  ## Convenience vs. Dependence
                  While devices make life easier, they also make users dependent. A simple GPS error today can paralyze a driver. Is this empowerment, or a quiet erosion of basic skills?
                  ## Productivity or Distraction?
                  We were promised productivity, yet attention spans are shorter, and constant notifications fragment focus. Technology may streamline tasks, but it also manufactures distractions.
                  ## Who Really Benefits?
                  Progress often favors corporations more than individuals. Data harvesting, planned obsolescence, and algorithmic manipulation suggest users are products, not customers.
                  ## Conclusion
                  The narrative of progress is seductive, but needs scrutiny. Not all innovation is improvemen# The Illusion of Progress in Modern Technology
                  Technology advances rapidly—faster processors, smarter AI, thinner phones. But are these truly signs of progress?
                  ## Convenience vs. Dependence
                  While devices make life easier, they also make users dependent. A simple GPS error today can paralyze a driver. Is this empowerment, or a quiet erosion of basic skills?
                  ## Productivity or Distraction?
                  We were promised productivity, yet attention spans are shorter, and constant notifications fragment focus. Technology may streamline tasks, but it also manufactures distractions.
                  ## Who Really Benefits?
                  Progress often favors corporations more than individuals. Data harvesting, planned obsolescence, and algorithmic manipulation suggest users are products, not customers.
                  ## Conclusion
                  The narrative of progress is seductive, but needs scrutiny. Not all innovation is improvemen# The Illusion of Progress in Modern Technology
                  Technology advances rapidly—faster processors, smarter AI, thinner phones. But are these truly signs of progress?
                  ## Convenience vs. Dependence
                  While devices make life easier, they also make users dependent. A simple GPS error today can paralyze a driver. Is this empowerment, or a quiet erosion of basic skills?
                  ## Productivity or Distraction?
                  We were promised productivity, yet attention spans are shorter, and constant notifications fragment focus. Technology may streamline tasks, but it also manufactures distractions.
                  ## Who Really Benefits?
                  Progress often favors corporations more than individuals. Data harvesting, planned obsolescence, and algorithmic manipulation suggest users are products, not customers.
                  ## Conclusion
                  The narrative of progress is seductive, but needs scrutiny. Not all innovation is improvemen# The Illusion of Progress in Modern Technology
                  Technology advances rapidly—faster processors, smarter AI, thinner phones. But are these truly signs of progress?
                  ## Convenience vs. Dependence
                  While devices make life easier, they also make users dependent. A simple GPS error today can paralyze a driver. Is this empowerment, or a quiet erosion of basic skills?
                  ## Productivity or Distraction?
                  We were promised productivity, yet attention spans are shorter, and constant notifications fragment focus. Technology may streamline tasks, but it also manufactures distractions.
                  ## Who Really Benefits?
                  Progress often favors corporations more than individuals. Data harvesting, planned obsolescence, and algorithmic manipulation suggest users are products, not customers.
                  ## Conclusion
                  The narrative of progress is seductive, but needs scrutiny. Not all innovation is improvemen# The Illusion of Progress in Modern Technology
                  Technology advances rapidly—faster processors, smarter AI, thinner phones. But are these truly signs of progress?
                  ## Convenience vs. Dependence
                  While devices make life easier, they also make users dependent. A simple GPS error today can paralyze a driver. Is this empowerment, or a quiet erosion of basic skills?
                  ## Productivity or Distraction?
                  We were promised productivity, yet attention spans are shorter, and constant notifications fragment focus. Technology may streamline tasks, but it also manufactures distractions.
                  ## Who Really Benefits?
                  Progress often favors corporations more than individuals. Data harvesting, planned obsolescence, and algorithmic manipulation suggest users are products, not customers.
                  ## Conclusion
                  The narrative of progress is seductive, but needs scrutiny. Not all innovation is improvemen# The Illusion of Progress in Modern Technology
                  Technology advances rapidly—faster processors, smarter AI, thinner phones. But are these truly signs of progress?
                  ## Convenience vs. Dependence
                  While devices make life easier, they also make users dependent. A simple GPS error today can paralyze a driver. Is this empowerment, or a quiet erosion of basic skills?
                  ## Productivity or Distraction?
                  We were promised productivity, yet attention spans are shorter, and constant notifications fragment focus. Technology may streamline tasks, but it also manufactures distractions.
                  ## Who Really Benefits?
                  Progress often favors corporations more than individuals. Data harvesting, planned obsolescence, and algorithmic manipulation suggest users are products, not customers.
                  ## Conclusion
                  The narrative of progress is seductive, but needs scrutiny. Not all innovation is improvemen' 
            onDrop={handleDrop}
          />
        </div>

        </div>
    </>
  );
}

export default App;