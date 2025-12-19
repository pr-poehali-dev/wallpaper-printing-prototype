import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Product {
  id: number;
  name: string;
  category: string;
  style: string;
  price: number;
  discount?: number;
  image: string;
  sizes: string[];
  materials: string[];
}

interface CartItem extends Product {
  selectedSize: string;
  selectedMaterial: string;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  status: 'processing' | 'printing' | 'shipping' | 'delivered';
  items: CartItem[];
  total: number;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Горный рассвет',
    category: 'Природа',
    style: 'Пейзаж',
    price: 4500,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    sizes: ['2x3м', '3x4м', '4x5м'],
    materials: ['Флизелин', 'Винил', 'Бумага'],
  },
  {
    id: 2,
    name: 'Тропический лес',
    category: 'Природа',
    style: 'Ботанический',
    price: 5200,
    image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800',
    sizes: ['2x3м', '3x4м', '4x5м'],
    materials: ['Флизелин', 'Винил', 'Бумага'],
  },
  {
    id: 3,
    name: 'Городские огни',
    category: 'Города',
    style: 'Урбан',
    price: 4800,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
    sizes: ['2x3м', '3x4м', '4x5м'],
    materials: ['Флизелин', 'Винил', 'Бумага'],
  },
  {
    id: 4,
    name: 'Абстракция акварель',
    category: 'Абстракция',
    style: 'Художественный',
    price: 6000,
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    sizes: ['2x3м', '3x4м', '4x5м'],
    materials: ['Флизелин', 'Винил', 'Бумага'],
  },
  {
    id: 5,
    name: 'Океанская волна',
    category: 'Природа',
    style: 'Морской',
    price: 4700,
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
    sizes: ['2x3м', '3x4м', '4x5м'],
    materials: ['Флизелин', 'Винил', 'Бумага'],
  },
  {
    id: 6,
    name: 'Минимализм геометрия',
    category: 'Абстракция',
    style: 'Минимализм',
    price: 5500,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800',
    sizes: ['2x3м', '3x4м', '4x5м'],
    materials: ['Флизелин', 'Винил', 'Бумага'],
  },
];

const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    date: '2024-12-15',
    status: 'printing',
    items: [
      {
        ...mockProducts[0],
        selectedSize: '3x4м',
        selectedMaterial: 'Флизелин',
        quantity: 1,
      },
    ],
    total: 4050,
  },
  {
    id: 'ORD-2024-002',
    date: '2024-12-10',
    status: 'delivered',
    items: [
      {
        ...mockProducts[2],
        selectedSize: '2x3м',
        selectedMaterial: 'Винил',
        quantity: 1,
      },
    ],
    total: 4080,
  },
];

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [activeView, setActiveView] = useState<'catalog' | 'profile'>('catalog');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [showCustomUpload, setShowCustomUpload] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customImageName, setCustomImageName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['Все', 'Природа', 'Города', 'Абстракция'];

  const filteredProducts =
    selectedCategory === 'Все'
      ? mockProducts
      : mockProducts.filter((p) => p.category === selectedCategory);

  const calculatePrice = (product: Product) => {
    const basePrice = product.price;
    const discountAmount = product.discount ? (basePrice * product.discount) / 100 : 0;
    return basePrice - discountAmount;
  };

  const addToCart = () => {
    if (!selectedProduct || !selectedSize || !selectedMaterial) return;

    const existingItem = cart.find(
      (item) =>
        item.id === selectedProduct.id &&
        item.selectedSize === selectedSize &&
        item.selectedMaterial === selectedMaterial
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item === existingItem ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...selectedProduct,
          selectedSize,
          selectedMaterial,
          quantity: 1,
        },
      ]);
    }

    setSelectedProduct(null);
    setSelectedSize('');
    setSelectedMaterial('');
  };

  const applyPromoCode = () => {
    if (promoCode === 'WELCOME10') {
      setAppliedPromo({ code: promoCode, discount: 10 });
    } else if (promoCode === 'LOYAL20') {
      setAppliedPromo({ code: promoCode, discount: 20 });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
        setCustomImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const createCustomProduct = () => {
    if (!customImage || !customImageName || !selectedSize || !selectedMaterial) return;

    const customProduct: Product = {
      id: Date.now(),
      name: customImageName.replace(/\.[^/.]+$/, ''),
      category: 'Пользовательские',
      style: 'Индивидуальный дизайн',
      price: 5800,
      image: customImage,
      sizes: ['2x3м', '3x4м', '4x5м'],
      materials: ['Флизелин', 'Винил', 'Бумага'],
    };

    setCart([
      ...cart,
      {
        ...customProduct,
        selectedSize,
        selectedMaterial,
        quantity: 1,
      },
    ]);

    setShowCustomUpload(false);
    setCustomImage(null);
    setCustomImageName('');
    setSelectedSize('');
    setSelectedMaterial('');
  };

  const cartTotal = cart.reduce((sum, item) => sum + calculatePrice(item) * item.quantity, 0);
  const promoDiscount = appliedPromo ? (cartTotal * appliedPromo.discount) / 100 : 0;
  const finalTotal = cartTotal - promoDiscount;

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return 'Clock';
      case 'printing':
        return 'Printer';
      case 'shipping':
        return 'Truck';
      case 'delivered':
        return 'CheckCircle';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return 'Обработка';
      case 'printing':
        return 'Печать';
      case 'shipping':
        return 'Доставка';
      case 'delivered':
        return 'Доставлено';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Image" size={28} className="text-primary" />
            <h1 className="text-2xl font-bold">PhotoWalls</h1>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setActiveView('catalog')}
              className={`text-sm font-medium transition-colors ${
                activeView === 'catalog' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Каталог
            </button>
            <button
              onClick={() => setActiveView('profile')}
              className={`text-sm font-medium transition-colors ${
                activeView === 'profile' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Личный кабинет
            </button>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              О компании
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Icon name="ShoppingCart" size={20} />
                  {cart.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {cart.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Корзина</SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-4">
                  <ScrollArea className="h-[400px]">
                    {cart.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Корзина пуста</p>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-20 h-20 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm">{item.name}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {item.selectedSize} • {item.selectedMaterial}
                                  </p>
                                  <p className="text-sm font-semibold mt-2">
                                    {calculatePrice(item).toLocaleString()} ₽
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Количество: {item.quantity}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {cart.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Промокод"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                          />
                          <Button onClick={applyPromoCode} size="sm">
                            Применить
                          </Button>
                        </div>
                        {appliedPromo && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Icon name="CheckCircle" size={16} />
                            <span>Промокод {appliedPromo.code} применён (-{appliedPromo.discount}%)</span>
                          </div>
                        )}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Подытог:</span>
                            <span>{cartTotal.toLocaleString()} ₽</span>
                          </div>
                          {promoDiscount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Скидка:</span>
                              <span>-{promoDiscount.toLocaleString()} ₽</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between font-bold text-base">
                            <span>Итого:</span>
                            <span>{finalTotal.toLocaleString()} ₽</span>
                          </div>
                        </div>
                        <Button className="w-full" size="lg">
                          Оформить заказ
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Icon name="Menu" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {activeView === 'catalog' ? (
          <>
            <section className="text-center mb-16 animate-fade-in">
              <h2 className="text-5xl font-bold mb-4">Фотообои на заказ</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Превратите любое пространство в произведение искусства с нашими качественными фотообоями
              </p>
            </section>

            <div className="mb-8 flex items-center gap-2 text-sm">
              <Icon name="Tag" size={16} className="text-primary" />
              <span className="font-semibold">Специальные предложения:</span>
              <Badge variant="secondary">WELCOME10 - 10% скидка для новых клиентов</Badge>
              <Badge variant="secondary">LOYAL20 - 20% постоянным клиентам</Badge>
            </div>

            <div className="flex items-center justify-between mb-12">
              <Tabs defaultValue="Все" className="flex-1">
                <TabsList className="w-full justify-start">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Button
                onClick={() => setShowCustomUpload(true)}
                className="ml-4"
                size="lg"
              >
                <Icon name="Upload" size={20} className="mr-2" />
                Загрузить своё фото
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer overflow-hidden hover:shadow-xl transition-shadow"
                  onClick={() => setSelectedProduct(product)}
                >
                  <CardHeader className="p-0 relative">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {product.discount && (
                      <Badge className="absolute top-4 right-4 bg-red-500">
                        -{product.discount}%
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{product.style}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.discount ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold">
                              {calculatePrice(product).toLocaleString()} ₽
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {product.price.toLocaleString()} ₽
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold">
                            {product.price.toLocaleString()} ₽
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <section id="about" className="mt-24 bg-muted/30 rounded-2xl p-12">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6">О компании</h2>
                <p className="text-muted-foreground mb-8">
                  Мы специализируемся на печати фотообоев высочайшего качества. Используем современное
                  оборудование и экологичные материалы. Каждый заказ проходит строгий контроль качества.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  <div>
                    <Icon name="Award" size={40} className="mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Гарантия качества</h3>
                    <p className="text-sm text-muted-foreground">5 лет гарантии на печать</p>
                  </div>
                  <div>
                    <Icon name="Truck" size={40} className="mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Быстрая доставка</h3>
                    <p className="text-sm text-muted-foreground">Доставим за 3-5 дней</p>
                  </div>
                  <div>
                    <Icon name="Sparkles" size={40} className="mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Эко-материалы</h3>
                    <p className="text-sm text-muted-foreground">Безопасно для здоровья</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold mb-8">Личный кабинет</h2>

            <div className="grid gap-6 mb-12">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="User" size={32} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Иван Петров</h3>
                      <p className="text-sm text-muted-foreground">ivan.petrov@email.com</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">Ваши скидки</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon name="Percent" className="text-primary" />
                        <div>
                          <p className="font-semibold">LOYAL20</p>
                          <p className="text-sm text-muted-foreground">Скидка 20% постоянным клиентам</p>
                        </div>
                      </div>
                      <Badge>Активен</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon name="Gift" className="text-primary" />
                        <div>
                          <p className="font-semibold">BIRTHDAY15</p>
                          <p className="text-sm text-muted-foreground">День рождения - 15% скидка</p>
                        </div>
                      </div>
                      <Badge variant="outline">Скоро</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-2xl font-bold mb-6">История заказов</h3>
            <div className="space-y-6">
              {mockOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Заказ {order.id}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <Badge
                        variant={order.status === 'delivered' ? 'default' : 'secondary'}
                        className="flex items-center gap-2"
                      >
                        <Icon name={getStatusIcon(order.status)} size={14} />
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.selectedSize} • {item.selectedMaterial}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {calculatePrice(item).toLocaleString()} ₽
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold">Итого:</span>
                      <span className="text-xl font-bold">{order.total.toLocaleString()} ₽</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-[4/3] rounded-lg overflow-hidden">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{selectedProduct.category}</Badge>
                      <Badge variant="outline">{selectedProduct.style}</Badge>
                    </div>
                    {selectedProduct.discount ? (
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold">
                          {calculatePrice(selectedProduct).toLocaleString()} ₽
                        </span>
                        <span className="text-lg text-muted-foreground line-through">
                          {selectedProduct.price.toLocaleString()} ₽
                        </span>
                        <Badge className="bg-red-500">-{selectedProduct.discount}%</Badge>
                      </div>
                    ) : (
                      <span className="text-3xl font-bold">
                        {selectedProduct.price.toLocaleString()} ₽
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Выберите размер:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProduct.sizes.map((size) => (
                        <Button
                          key={size}
                          variant={selectedSize === size ? 'default' : 'outline'}
                          onClick={() => setSelectedSize(size)}
                          className="w-full"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Выберите материал:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProduct.materials.map((material) => (
                        <Button
                          key={material}
                          variant={selectedMaterial === material ? 'default' : 'outline'}
                          onClick={() => setSelectedMaterial(material)}
                          className="w-full"
                        >
                          {material}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={addToCart}
                    disabled={!selectedSize || !selectedMaterial}
                  >
                    <Icon name="ShoppingCart" size={20} className="mr-2" />
                    Добавить в корзину
                  </Button>

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="CheckCircle" size={16} className="text-primary" />
                      <span>Высокое качество печати</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="CheckCircle" size={16} className="text-primary" />
                      <span>Экологичные материалы</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="CheckCircle" size={16} className="text-primary" />
                      <span>Гарантия 5 лет</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCustomUpload} onOpenChange={setShowCustomUpload}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Загрузить своё изображение</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {!customImage ? (
                <div className="space-y-4">
                  <Icon name="Upload" size={48} className="mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-semibold mb-2">
                      Выберите изображение для печати
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      JPG, PNG или WEBP до 10MB
                    </p>
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()} size="lg">
                    <Icon name="FolderOpen" size={20} className="mr-2" />
                    Выбрать файл
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <img
                    src={customImage}
                    alt="Preview"
                    className="max-h-80 mx-auto rounded-lg object-contain"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <Icon name="Image" size={16} className="text-primary" />
                    <span className="font-medium">{customImageName}</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCustomImage(null);
                      setCustomImageName('');
                    }}
                  >
                    Выбрать другое изображение
                  </Button>
                </div>
              )}
            </div>

            {customImage && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Выберите размер:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['2x3м', '3x4м', '4x5м'].map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? 'default' : 'outline'}
                        onClick={() => setSelectedSize(size)}
                        className="w-full"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Выберите материал:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Флизелин', 'Винил', 'Бумага'].map((material) => (
                      <Button
                        key={material}
                        variant={selectedMaterial === material ? 'default' : 'outline'}
                        onClick={() => setSelectedMaterial(material)}
                        className="w-full"
                      >
                        {material}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {customImage && (
              <>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Стоимость:</span>
                    <span className="text-2xl font-bold">5,800 ₽</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Индивидуальная печать на выбранном материале
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={createCustomProduct}
                  disabled={!selectedSize || !selectedMaterial}
                >
                  <Icon name="ShoppingCart" size={20} className="mr-2" />
                  Добавить в корзину
                </Button>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle" size={16} className="text-primary" />
                    <span>Профессиональная цветокоррекция</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle" size={16} className="text-primary" />
                    <span>Печать высокого разрешения</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle" size={16} className="text-primary" />
                    <span>Бесплатная консультация по подготовке файла</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <footer className="bg-muted/30 mt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Image" size={24} className="text-primary" />
                <span className="text-lg font-bold">PhotoWalls</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Качественные фотообои для вашего интерьера
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Каталог</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Природа</li>
                <li>Города</li>
                <li>Абстракция</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Информация</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>О компании</li>
                <li>Доставка</li>
                <li>Гарантии</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>+7 (913) 991-70-08</li>
                <li>sosiski@photowalls.ru</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <p className="text-center text-sm text-muted-foreground">
            © 2024 PhotoWalls. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}