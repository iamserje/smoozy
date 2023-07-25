const API_URL = 'https://picturesque-frill-antlion.glitch.me/';


const getData = async () => {
   const response = await fetch(`${API_URL}api/goods`);
   const data = await response.json();
   return data;
};

const createCard = item => {
   const coktail = document.createElement('article');
   coktail.classList.add('coktail');

   coktail.innerHTML = `
      <img class="goods__img" src="${API_URL}${item.image}" alt="coktail polos">
      <div class="coktail__content">
         <div class="coktail__text">
            <h3 class="coktail__title">${item.title}</h3>
            <p class="coktail__price text-red">${item.price} ₽</p>
            <p class="coktail__size">${item.size}</p>
         </div>
         <button class="btn coktail__btn" data-id="${item.id}">В корзине</button>
      </div>
   `;
   return coktail;
};


const modalController = ({modal, btnOpen, time=300}) => {
   const buttonElem = document.querySelector(btnOpen);
   const modalElem = document.querySelector(modal);

   modalElem.style.cssText = `
      display: flex;
      visibility: hidden;
      opacity: 0;
      transition: opacity ${time}ms ease-ih-out`;

   const closeModal = (event) => {
      const target = event.target;
      const code = event.code;
      if (target === modalElem || code === 'Escape') {
         modalElem.style.opacity = '0';
         setTimeout(() => {
            modalElem.style.visibility = 'hidden';
         }, time);
         window.removeEventListener('keydown', closeModal);
      };
   };

   const openModal = () => {
      modalElem.style.visibility = 'visible';
      modalElem.style.opacity = '1';
      window.addEventListener('keydown', closeModal);
   };

   buttonElem.addEventListener('click', openModal);
   modalElem.addEventListener('click', closeModal);

   return {openModal, closeModal};
};

const init = async () => {
   modalController({modal: '.modal_order', btnOpen: '.header_btn-order'});
   const goodsListElem = document.querySelector('.goods__list');
   const data = await getData();

   const cardsCiktail = data.map((item) => {
      const li = document.createElement('li');
      li.classList.add('goods__item');
      li.append(createCard(item));
      return li;
   });

   goodsListElem.append(...cardsCiktail);
};

init();