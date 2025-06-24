import '../style/CategoryCard.css'
import CategoryCard from './CategoryCard';

type DropHandler = (event: MouseEvent) => void;

interface CategoryCollectionProps {
  registerDropHandler: (text: string, handler: DropHandler) => void;
}

function CategoryCollection({ registerDropHandler }: CategoryCollectionProps) {
  return (
    <div className='category-collection'>
        <CategoryCard 
            text='OOF' 
            registerDropHandler={registerDropHandler}
        />
        <CategoryCard 
            text='SAD' 
            registerDropHandler={registerDropHandler}
        />
    </div>
  );
}

export default CategoryCollection;
