import React from "react";

export default function BlogContent() {
  return (
    <div className="max-w-[800px] mx-auto px-margin-mobile md:px-0">
      <article className="article-content font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
        <p className="first-letter:text-7xl first-letter:font-serif-accent first-letter:text-primary first-letter:mr-3 first-letter:float-left">
          Trong thế giới của sự vội vã và những xu hướng thay đổi chóng mặt, có một thứ giá trị vẫn luôn bền bỉ theo thời gian: sự chỉn chu của một người đàn ông. Tại HALLO BARBER, chúng tôi tin rằng việc cắt tóc không đơn thuần là một dịch vụ, mà là một trải nghiệm về sự kế thừa và tinh hoa.
        </p>
        
        <h2 className="font-serif-accent italic text-3xl text-primary mt-12 mb-6">Sự Tái Sinh Của Barber Shop Cổ Điển</h2>
        <p>
          Barber Shop không chỉ là nơi để cắt tóc. Đó là không gian văn hóa, nơi những câu chuyện được kể và phong cách được định hình. Những năm gần đây, chúng ta chứng kiến sự trỗi dậy mạnh mẽ của phong cách "Classic" – nơi những bộ râu được tỉ mỉ chăm sóc và những đường Fade được thực hiện với độ chính xác tuyệt đối.
        </p>
        
        <div className="my-12 p-8 border-l-4 border-primary bg-surface-container italic font-serif-accent text-2xl text-on-surface">
          "Một kiểu tóc đẹp có thể thay đổi diện mạo, nhưng một trải nghiệm Barber thực thụ có thể thay đổi cách một người đàn ông nhìn nhận chính mình."
        </div>
        
        <h3 className="font-headline-sm text-on-surface mt-10 mb-4">Kỹ Thuật Và Tâm Huyết</h3>
        <p>
          Để tạo ra một tác phẩm hoàn hảo, người thợ không chỉ dùng kéo. Họ dùng cả sự quan sát, thấu hiểu cấu trúc khuôn mặt và chất tóc của mỗi khách hàng. Từng đường cạo, từng lớp sáp vuốt tóc đều được cân nhắc kỹ lưỡng để tôn vinh nét nam tính và lịch lãm.
        </p>
        
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-12">
          <div className="aspect-square rounded-lg overflow-hidden border border-outline-variant">
            <img 
              alt="Macro close-up shot of a sharp straight razor" 
              className="w-full h-full object-cover grayscale-hover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0E-yPRNAwZEHgfuw9pfLUjx6GnOPYk-teqVhryHNJpGJWMNpLLjkKlJqK1VZircSLDshlSYWmiKoUjdgRPMNHzHR8yTMlPokTT96bHpC8oa9Kg3z7Xi_CqOPvM3zZBuarbqsKlZPZZrxvBBmSCyBknFtiPejX28ksfkEfTUnU0tvAnDSykThq6m5eak-l6SiRPkKzBo3T6SEMBAbsa8LOg7G7ibReJ5-DeceqKUR5AqUs6TkRpQY3AAWevabhSc2uKBu58M3rwDeg" 
            />
          </div>
          <div className="aspect-square rounded-lg overflow-hidden border border-outline-variant">
            <img 
              alt="A vintage barber station" 
              className="w-full h-full object-cover grayscale-hover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_gJHEtvIctHo9ni6hgUc3RYdUL1hoyXaMsxFQ4FV0QgFN6ySqn-4obPDSYF_U457lZuNwn4upm8IdSeUgDPzpoxEOOhjzqy6MNzd-mnV35qLUmc7X9g30174cPYxsYV6-B9mOuQq0hfi1U0qjoSkGFN7sHgA1d_GRdL6JiTkZrcIXhhIxRaCFFKNOhg9bF91Ur-kSPckKopW1CJOUPnh_gnCoMgntjcqGnmsRgFHk023b1j8Sy2GL_xCENRGfh6TqrmTdMTPtDHwB" 
            />
          </div>
        </div>
        
        <p>
          Kết thúc một buổi làm đẹp tại HALLO BARBER luôn là sự thư giãn tuyệt đối với quy trình khăn nóng và massage da đầu – một đặc quyền mà bất kỳ quý ông nào cũng xứng đáng được hưởng thụ sau những giờ làm việc căng thẳng.
        </p>
      </article>
      
      {/* Social Share */}
      <div className="flex items-center justify-center space-x-4 mt-16 pt-8 border-t border-outline-variant">
        <span className="text-label-md text-outline uppercase tracking-widest">Chia sẻ:</span>
        <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-sm">share</span>
        </button>
        <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-sm">bookmark</span>
        </button>
      </div>
    </div>
  );
}
