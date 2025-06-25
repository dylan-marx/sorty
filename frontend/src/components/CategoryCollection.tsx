import '../style/CategoryCollection.css'
import CategoryCard from './CategoryCard';

type DropHandler = (event: MouseEvent) => void;

interface CategoryCollectionProps {
  registerDropHandler: (text: string, handler: DropHandler) => void;
  categories?: string[];
  id?: string;
}

function CategoryCollection({ categories, id, registerDropHandler }: CategoryCollectionProps) {
  const defaultCategories = ['Yes', 'No'];
  const categoryList = categories ?? defaultCategories;
  return (
    <div className='category-collection'>
      {categoryList.map((category) => (
        <CategoryCard 
          key={category}
          text={category}
          id={id}
          registerDropHandler={registerDropHandler}
        />
      ))}
    </div>
  );
}

export default CategoryCollection;
