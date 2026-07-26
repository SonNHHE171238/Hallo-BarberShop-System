"use client";

import React, { useState, useRef, useEffect } from "react";
import toast from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import MessageBubble from "./MessageBubble";

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return `http://${window.location.hostname}:5000/api/chatbot`;
  return 'http://localhost:5000/api/chatbot';
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuData, setMenuData] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isBarberMenuOpen, setIsBarberMenuOpen] = useState(false);
  const [barberData, setBarberData] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [productData, setProductData] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pathname = usePathname();


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const handleOpenChat = () => {
      if (!isOpen && messages.length === 0) {
        setIsOpen(true);
        setMessages([{ role: "system", content: "Chào bạn! Tôi là trợ lý AI của Hallo BarberShop. Bạn cần tôi giúp gì về dịch vụ, thợ cắt tóc hoặc giá cả?" }]);
      } else {
        setIsOpen(true);
      }
    };
    window.addEventListener('open-chatbot', handleOpenChat);
    return () => window.removeEventListener('open-chatbot', handleOpenChat);
  }, [isOpen, messages.length]);

  const toggleChat = () => {
    if (!isOpen && messages.length === 0) {
      setMessages([{ role: "system", content: "Chào bạn! Tôi là trợ lý AI của Hallo BarberShop. Bạn cần tôi giúp gì về dịch vụ, thợ cắt tóc hoặc giá cả?" }]);
    }
    setIsOpen(!isOpen);
  };

  const sendMessage = async (e) => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg = input.trim();
    const imageToSend = selectedImage;
    setInput("");
    setSelectedImage(null);

    // Convert current messages to history format
    const history = messages.filter(m => m.role === 'user' || m.role === 'ai').map(m => ({
      role: m.role,
      content: m.content
    }));

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg, image: imageToSend?.preview }
    ]);
    setIsLoading(true);

    try {
      const payload = { message: userMsg, history };
      if (imageToSend) {
        payload.imageBase64 = imageToSend.base64;
        payload.mimeType = imageToSend.mimeType;
      }

      const res = await fetch(getBaseUrl(), { // Default backend port might be 5000 or from env
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        if (data.type === 'hairstyle_advice') {
          setMessages((prev) => [...prev, { role: "ai", isAdvice: true, data: data.data }]);
        } else if (data.type === 'menu') {
          setMessages((prev) => [...prev, { role: "ai", isMenu: true, content: data.data.text, services: data.data.services }]);
        } else if (data.type === 'barber_menu') {
          setMessages((prev) => [...prev, { role: "ai", isBarberMenu: true, content: data.data.text, barbers: data.data.barbers }]);
        } else if (data.type === 'product_menu') {
          setMessages((prev) => [...prev, { role: "ai", isProductMenu: true, text: data.data.text, products: data.data.products }]);
        } else {
          setMessages((prev) => [...prev, { role: "ai", content: data.data }]);
        }
      } else {
        setMessages((prev) => [...prev, { role: "system", content: "Lỗi kết nối với máy chủ AI." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "system", content: "Không thể kết nối với server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh quá lớn, vui lòng chọn ảnh < 5MB.");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setSelectedImage({
          preview: reader.result,
          base64: base64String,
          mimeType: file.type
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    }
  };


  // Hide chatbot on admin, staff, and barber dashboards
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/staff') || pathname?.startsWith('/barber')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Nút bong bóng chat */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-primary hover:bg-primary-fixed text-on-primary rounded-full p-4 shadow-lg shadow-primary/20 transition-transform transform hover:scale-105 flex items-center justify-center border border-primary/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="bg-surface-container/90 backdrop-blur-md rounded-xl shadow-2xl shadow-black/50 w-80 md:w-96 overflow-hidden flex flex-col border border-outline-gold" style={{ height: "500px" }}>
          {/* Header */}
          <div className="bg-surface-container-high border-b border-outline-gold text-primary p-4 flex justify-between items-center shadow-sm">
            <div className="font-semibold font-headline-sm uppercase tracking-wider flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Trợ lý Hallo
            </div>
            <button onClick={toggleChat} className="text-on-surface-variant hover:text-error transition-colors focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-surface-container-lowest/50 custom-scrollbar flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <MessageBubble 
                key={idx} 
                msg={msg}
                setMenuData={setMenuData}
                setSelectedServices={setSelectedServices}
                setIsMenuOpen={setIsMenuOpen}
                setBarberData={setBarberData}
                setSelectedBarber={setSelectedBarber}
                setIsBarberMenuOpen={setIsBarberMenuOpen}
                setProductData={setProductData}
                setIsProductMenuOpen={setIsProductMenuOpen}
              />
            ))}



            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-container-high border border-outline-gold/30 text-primary rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-surface-container-high border-t border-outline-gold">
            {selectedImage && (
              <div className="mb-2 relative inline-block">
                <img src={selectedImage.preview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-outline-variant" />
                <button
                  onClick={() => { setSelectedImage(null); }}
                  className="absolute -top-2 -right-2 bg-error text-white rounded-full p-0.5 hover:bg-error/90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            <form onSubmit={sendMessage} className="flex gap-2 relative items-center">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-on-surface-variant hover:text-primary transition-colors p-1"
                title="Tải ảnh lên"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant text-on-surface placeholder-outline-variant rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-sm disabled:opacity-50 disabled:bg-surface-container transition-all"
              />
              <button
                type="submit"
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="bg-primary text-on-primary rounded-full p-2.5 hover:bg-primary-fixed disabled:bg-outline-variant disabled:text-on-surface-variant disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Menu Modal Overlay */}
      {isMenuOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 rounded-2xl">
          <div className="bg-surface w-full max-w-sm rounded-2xl shadow-xl flex flex-col max-h-[90%] overflow-hidden border border-outline-variant">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
              <h3 className="font-bold text-primary">Chọn Dịch Vụ</h3>
              <button onClick={() => setIsMenuOpen(false)} className="text-on-surface-variant hover:text-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
              {menuData.map((svc, i) => (
                <label key={i} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedServices.includes(svc.name) ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container'}`}>
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-primary bg-surface-container-highest border-outline-variant rounded focus:ring-primary focus:ring-2"
                    checked={selectedServices.includes(svc.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedServices(prev => [...prev, svc.name]);
                      } else {
                        setSelectedServices(prev => prev.filter(s => s !== svc.name));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-on-surface">{svc.name}</p>
                    <p className="text-xs text-secondary mt-0.5">{svc.price.toLocaleString('vi-VN')} VNĐ</p>
                    {svc.description && <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">{svc.description}</p>}
                  </div>
                </label>
              ))}
            </div>
            <div className="p-4 border-t border-outline-variant bg-surface-container-high">
              <button
                onClick={() => {
                  if (selectedServices.length > 0) {
                    setIsMenuOpen(false);
                    const userMsg = `Tôi đã chọn các dịch vụ: ${selectedServices.join(', ')}`;

                    const history = messages.filter(m => m.role === 'user' || m.role === 'ai').map(m => ({ role: m.role, content: m.content }));
                    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
                    setIsLoading(true);

                    fetch(getBaseUrl(), {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ message: userMsg, history }),
                    }).then(res => res.json()).then(data => {
                      if (data.success) {
                        if (data.type === 'hairstyle_advice') {
                          setMessages((prev) => [...prev, { role: "ai", isAdvice: true, data: data.data }]);
                        } else if (data.type === 'menu') {
                          setMessages((prev) => [...prev, { role: "ai", isMenu: true, content: data.data.text, services: data.data.services }]);
                        } else if (data.type === 'barber_menu') {
                          setMessages((prev) => [...prev, { role: "ai", isBarberMenu: true, content: data.data.text, barbers: data.data.barbers }]);
                        } else {
                          setMessages((prev) => [...prev, { role: "ai", content: data.data }]);
                        }
                      } else {
                        setMessages((prev) => [...prev, { role: "system", content: "Lỗi kết nối với máy chủ AI." }]);
                      }
                    }).catch(error => {
                      setMessages((prev) => [...prev, { role: "system", content: "Không thể kết nối với server." }]);
                    }).finally(() => setIsLoading(false));
                  } else {
                    toast.error('Vui lòng chọn ít nhất 1 dịch vụ');
                  }
                }}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-primary-fixed shadow-md shadow-primary/20"
              >
                Xác nhận Lựa Chọn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barber Modal Overlay */}
      {isBarberMenuOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 rounded-2xl">
          <div className="bg-surface w-full max-w-sm rounded-2xl shadow-xl flex flex-col max-h-[90%] overflow-hidden border border-outline-variant">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
              <h3 className="font-bold text-primary">Chọn Thợ Cắt Tóc</h3>
              <button onClick={() => setIsBarberMenuOpen(false)} className="text-on-surface-variant hover:text-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3 max-h-[260px]">
              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedBarber === 'Any' ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container'}`}>
                <input
                  type="radio"
                  name="barberSelection"
                  className="w-4 h-4 text-primary bg-surface-container-highest border-outline-variant focus:ring-primary focus:ring-2"
                  checked={selectedBarber === 'Any'}
                  onChange={() => setSelectedBarber('Any')}
                />
                <div className="flex-1">
                  <p className="font-bold text-sm text-on-surface">Bất kỳ thợ nào</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Tiệm sẽ tự sắp xếp thợ phù hợp cho bạn</p>
                </div>
              </label>

              {barberData.map((barber, i) => (
                <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedBarber === barber.name ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container'}`}>
                  <input
                    type="radio"
                    name="barberSelection"
                    className="w-4 h-4 text-primary bg-surface-container-highest border-outline-variant focus:ring-primary focus:ring-2"
                    checked={selectedBarber === barber.name}
                    onChange={() => setSelectedBarber(barber.name)}
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-on-surface">{barber.name}</p>
                    {barber.experienceYears !== null && (
                      <p className="text-xs text-secondary mt-0.5">Kinh nghiệm: {barber.experienceYears} năm</p>
                    )}
                    {barber.specialties && barber.specialties.length > 0 && (
                      <p className="text-[11px] text-on-surface-variant mt-0.5">Chuyên môn: {barber.specialties.join(', ')}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <div className="p-4 border-t border-outline-variant bg-surface-container-high">
              <button
                onClick={() => {
                  if (selectedBarber) {
                    setIsBarberMenuOpen(false);
                    const userMsg = selectedBarber === 'Any' ? `Tôi không yêu cầu thợ cụ thể, tiệm tự sắp xếp nhé` : `Tôi đã chọn thợ: ${selectedBarber}`;

                    const history = messages.filter(m => m.role === 'user' || m.role === 'ai').map(m => ({ role: m.role, content: m.content }));
                    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
                    setIsLoading(true);

                    fetch(getBaseUrl(), {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ message: userMsg, history }),
                    }).then(res => res.json()).then(data => {
                      if (data.success) {
                        if (data.type === 'hairstyle_advice') {
                          setMessages((prev) => [...prev, { role: "ai", isAdvice: true, data: data.data }]);
                        } else if (data.type === 'menu') {
                          setMessages((prev) => [...prev, { role: "ai", isMenu: true, content: data.data.text, services: data.data.services }]);
                        } else if (data.type === 'barber_menu') {
                          setMessages((prev) => [...prev, { role: "ai", isBarberMenu: true, content: data.data.text, barbers: data.data.barbers }]);
                        } else {
                          setMessages((prev) => [...prev, { role: "ai", content: data.data }]);
                        }
                      } else {
                        setMessages((prev) => [...prev, { role: "system", content: "Lỗi kết nối với máy chủ AI." }]);
                      }
                    }).catch(error => {
                      setMessages((prev) => [...prev, { role: "system", content: "Không thể kết nối với server." }]);
                    }).finally(() => setIsLoading(false));
                  } else {
                    toast.error('Vui lòng chọn 1 thợ hoặc tuỳ chọn Bất kỳ');
                  }
                }}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-primary-fixed shadow-md shadow-primary/20"
              >
                Xác nhận Lựa Chọn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Menu Modal */}
      {isProductMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsProductMenuOpen(false)}>
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-primary text-on-primary flex justify-between items-center">
              <h3 className="font-heading-md font-bold text-lg">Sản phẩm gợi ý</h3>
              <button onClick={() => setIsProductMenuOpen(false)} className="hover:bg-primary-fixed hover:text-on-primary-fixed p-1 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {productData.length === 0 ? (
                <p className="text-center text-on-surface-variant italic">Không có sản phẩm nào phù hợp.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {productData.map((prod, idx) => (
                    <div 
                      key={idx} 
                      className="border border-outline-variant/30 rounded-xl p-3 bg-surface flex flex-col cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                      onClick={() => {
                        setIsProductMenuOpen(false);
                        const msgText = `Tôi muốn mua sản phẩm ${prod.name}`;
                        setInput(msgText);
                      }}
                    >
                      <div className="w-full h-24 mb-2 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden">
                        {prod.image ? (
                           <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-xs text-on-surface-variant">No image</span>
                        )}
                      </div>
                      <div className="font-bold text-sm line-clamp-2 text-on-surface mb-1">{prod.name}</div>
                      <div className="text-xs text-on-surface-variant mb-1">{prod.brand}</div>
                      <div className="text-sm font-bold text-primary mt-auto">{prod.price.toLocaleString('vi-VN')}đ</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
