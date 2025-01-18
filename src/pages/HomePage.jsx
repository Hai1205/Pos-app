import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryList } from '../components/CategoryList';
import { MenuList } from '../components/MenuList';
import { Cart } from '../components/Cart';
import { SearchBar } from '../components/SearchBar';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import CartButton from '../components/CartButton.jsx';
import { PriceSlider } from '../components/PriceSlider';
import PriceFilter from '../components/PriceFilter';
import { useStatistics } from '../hooks/useStatistics';

export default function HomePage() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { menuItems, currentCategory, setCurrentCategory, toggleProductStatus } = useProducts(apiUrl);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const [sortOrder, setSortOrder] = useState('');
  const { cart, addToCart, removeFromCart, updateQuantity, total, itemCount } = useCart();
  const navigate = useNavigate();
  const { statistics } = useStatistics(apiUrl);
  const { topProducts } = statistics;

  const filteredItems = useMemo(() => {
    let items = currentCategory
      ? menuItems.filter(item => item.category === currentCategory && item.is_available)
      : menuItems.filter(item => item.is_available);
  
    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  
    items = items.filter(item => item.price >= minPrice && item.price <= maxPrice);
  
    if (sortOrder) {
      items = items.sort((a, b) => 
        sortOrder === 'asc' ? a.price - b.price : b.price - a.price
      );
    }
  
    return items;
  }, [menuItems, currentCategory, searchTerm, minPrice, maxPrice, sortOrder]);  

  const handleSearch = (term) => {
    setSearchTerm(term);
    setShowSuggestions(!!term);
  };

  const handlePriceChange = (newMinPrice, newMaxPrice) => {
    setMinPrice(newMinPrice);
    setMaxPrice(newMaxPrice);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  const handleToggleProductVisibility = async (product) => {
    const result = await toggleProductStatus(product.id, !product.is_available);
    if (result.success) {
      setMenuItems(prevItems => 
        prevItems.map(item => 
          item.id === product.id ? { ...item, is_available: !item.is_available } : item
        )
      );
    } else {
      alert('Đã có lỗi xảy ra khi thay đổi trạng thái sản phẩm.');
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/payment', { state: { cart, total } });
  }

  const handleShowDetails = (item) => {
    setSelectedItem(item);
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

  const handleAddToCartFromModal = (item) => {
    addToCart(item);
    setSelectedItem(null);
  };

  const searchSuggestions = useMemo(() => {
    if (searchTerm) {
      let items = currentCategory
        ? menuItems.filter(item => item.category === currentCategory && item.is_available)
        : menuItems.filter(item => item.is_available);

      return items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return [];
  }, [menuItems, currentCategory, searchTerm]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <CategoryList
            currentCategory={currentCategory}
            onSelectCategory={(category) => {
              setCurrentCategory(category);
              setSearchTerm('');
            }}
            searchTerm={searchTerm}
          />
          <div className="mt-4 md:mt-0">
            <CartButton 
              onClick={() => setIsCartOpen(true)} 
              itemCount={itemCount}
              className="md:static md:transform-none"
            />
          </div>
        </div>

        <SearchBar 
          searchTerm={searchTerm} 
          onSearchChange={handleSearch} 
          placeholder={currentCategory ? `Tìm kiếm trong ${currentCategory}` : "Tìm kiếm tất cả sản phẩm"}
        />
        
        {showSuggestions && searchSuggestions.length > 0 && (
           <ul className="absolute z-10 w-full max-w-[calc(100%-2rem)] left-0 right-0 mx-auto bg-white shadow-md rounded-lg overflow-hidden">
            {searchSuggestions.map(item => (
              <li 
                key={item.id} 
                className="px-4 py-2 cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
                onClick={() => {
                  setSearchTerm(item.name); 
                  setShowSuggestions(false);
                }}
              >
                {item.name}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <PriceSlider 
            items={menuItems}
            onPriceChange={handlePriceChange}
          />
          <PriceFilter onSortChange={handleSortChange} />
        </div>

        <MenuList 
          items={filteredItems} 
          onAddToCart={addToCart}
          onShowDetails={handleShowDetails}
          onToggleVisibility={handleToggleProductVisibility}
          topProducts={topProducts} 
        />
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <Cart
              cart={cart}
              total={total}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              onCheckout={handleCheckout}
              onClose={() => setIsCartOpen(false)}
            />
          </div>
        </div>
      )}

      <ProductDetailModal
        isOpen={!!selectedItem}
        closeModal={handleCloseDetails}
        item={selectedItem}
        onAddToCart={handleAddToCartFromModal}
      />
    </div>
  );
}

