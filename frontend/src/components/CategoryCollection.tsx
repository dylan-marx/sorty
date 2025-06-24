import '../style/CategoryCollection.css'
import CategoryCard from './CategoryCard';

type DropHandler = (event: MouseEvent) => void;

interface CategoryCollectionProps {
  registerDropHandler: (text: string, handler: DropHandler) => void;
}

function CategoryCollection({ registerDropHandler }: CategoryCollectionProps) {
  return (
    <div className='category-collection'>
        <CategoryCard 
            text='Harmfull' 
            registerDropHandler={registerDropHandler}
        />
        <CategoryCard 
            text='Harmless' 
            registerDropHandler={registerDropHandler}
        />
        <CategoryCard 
            text='Gibberish' 
            registerDropHandler={registerDropHandler}
        />
        <CategoryCard 
            text='Error' 
            registerDropHandler={registerDropHandler}
        />
    </div>
  );
}

export default CategoryCollection;
