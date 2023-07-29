const API_URL = 'https://picturesque-frill-antlion.glitch.me/';

const price = {
   Клубника: 60,
   Банан: 50,
   Манго: 70,
   Киви: 55,
   Маракуйя: 90,
   Яблоко: 45,
   Мята: 50,
   Лед: 10,
   Биоразлагаемый: 20,
   Пластиковый: 0,
};

const cartDataControl = {
   getLocalStorage() {
      return JSON.parse(localStorage.getItem('frshiBarCart') || '[]');
   },
   addLocalStorage(item) {
      const cartData = this.getLocalStorage();
      item.idls = Math.random().toString(36).substring(2, 10);
      cartData.push(item);
      localStorage.setItem('frshiBarCart', JSON.stringify(cartData));
   },
   removeLocalStorage(idls) {
      const cartData = this.getLocalStorage();
      const index = cartData.findIndex((item) => item.idls === id);
      localStorage.setItem('frshiBarCart', JSON.stringify(cartData));;
   },
   clearLocalStorage() {
      localStorage.removeItem('frshiBarCart');
   },
}

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
         <button class="btn coktail__btn_add" data-id="${item.id}">В корзине</button>
      </div>
   `;
   return coktail;
};

const scrollService = {
   scrollPosition: 0,
   disableScroll() {
      document.documentElement.style.scrollBehavior = 'auto';
      this.scrollPosition = window.scrollY;
      document.body.style.cssText = `
         overflo: hidden;
         position: fixed;
         top: -${this.scrollPosition}px;
         left: 0;
         width: 100vw;
         height: 100vh;
         padding-right:${window.innerWidth - document.body.offsetWidth}px;
      `;
   },
   enableScroll() {
      document.body.style.cssText = ``;
      window.scroll({top: this.scrollPosition});
      document.documentElement.style.scrollBehavior = '';
   }
};


const modalController = ({modal, btnOpen, time=300, open, close}) => {
   const buttonElem = document.querySelectorAll(btnOpen);
   const modalElem = document.querySelector(modal);

   modalElem.style.cssText = `
      display: flex;
      visibility: hidden;
      opacity: 0;
      transition: opacity ${time}ms ease-ih-out`;

   const closeModal = (event) => {
      const target = event.target;
      const code = event.code;
      if ( event === 'close' || target === modalElem || code === 'Escape') {
         modalElem.style.opacity = '0';
         setTimeout(() => {
            modalElem.style.visibility = 'hidden';
            scrollService.enableScroll();

            if (close) {
               close();
            }
         }, time);
         window.removeEventListener('keydown', closeModal);
      };
   };

   const openModal = (e) => {
      if (open) {
         open({ btn: e.target });
      }
      scrollService.disableScroll();
      modalElem.style.visibility = 'visible';
      modalElem.style.opacity = '1';
      window.addEventListener('keydown', closeModal);
   };

   buttonElem.forEach(elem => {
      elem.addEventListener('click', openModal);
   })
   modalElem.addEventListener('click', closeModal);

   modalElem.closeModal = closeModal;
   modalElem.openModal = openModal;

   return {openModal, closeModal};
};

const getFormData = (form) => {
   const formData = new FormData(form);
   const data = {};
   for (const [name, value] of formData.entries()) {
      if (data[name]) {
         if (!Array.isArray(data[name])) {
            data[name] = [data[name]];
         };
         data[name].push(value);
      } else {
         data[name] = value;
      }
   }
   return data;
};

const calculateTotalPrice = (form, startPrice) => {
   let totalPrice = startPrice;

   const data = getFormData(form)
   if (Array.isArray(data.ingridients)) {
      data.ingridients.forEach(item => {
         totalPrice += price[item] || 0;
      })
   } else {
      totalPrice += price[data.ingridients] || 0;
   }

   if (Array.isArray(data.toppings)) {
      data.toppings.forEach(item => {
         totalPrice += price[item] || 0;
      })
   } else {
      totalPrice += price[data.toppings] || 0;
   }

   totalPrice += price[data.cups] || 0;
   return totalPrice;
};

const formControl = (form, cb) => {
   form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = getFormData(form);
      cartDataControl.addLocalStorage(data);
      if (cb) {
         cb();
      }
   });
}

const calculateOun = () => {
   const modalMake = document.querySelector('.modal_make');
   const formMakeOne = modalMake.querySelector('.form__make_oun');
   const makeInputTitle = modalMake.querySelector('.make__input-title');
   const makeInputPrice = modalMake.querySelector('.make__input_price');
   const makeTotalPrise = modalMake.querySelector('.make__total-prise');
   const make_Btn = modalMake.querySelector('.make__btn');

   const handlerChange = () => {
      const totalPrice = calculateTotalPrice(formMakeOne, 150);
      const data = getFormData(formMakeOne);
      if (data.ingridients) {
         const ingridients = Array.isArray(data.ingridients)
         ? data.ingridients.join(', ')
         : data.ingridients;
         makeInputTitle.value = ` Конструктор: ${ingridients}`;
         make_Btn.disabled = false;
      } else {
         make_Btn.disabled = true;
      }
      makeInputPrice.value = totalPrice;
      makeTotalPrise.textContent = `${totalPrice} ₽`;
   };

   formMakeOne.addEventListener('change', handlerChange);
   formControl(formMakeOne, () => {
      modalMake.closeModal('close');
   });
   handlerChange();

   const resetForm = () => {
      makeTotalPrise.textContent = '';
      make_Btn.disabled = true;

      formMakeOne.reset();
   }
   return {resetForm};
};

const calculateAdd = () => {
   const modalAdd = document.querySelector('.modal_make-add');
   const makeTitle = modalAdd.querySelector('.make__title');
   const formMakeAdd = modalAdd.querySelector('.form__make_add');
   const makeInputTitle = modalAdd.querySelector('.make__input-title');
   const makeTotalPrise = modalAdd.querySelector('.make__total-prise');
   const makeInputStartPrice = modalAdd.querySelector('.make__input-start-price');
   const makeInputPrice = modalAdd.querySelector('.make__input-price');
   const makeTotalSize = modalAdd.querySelector('.make__total-size');
   const make_InputSize = modalAdd.querySelector('.make__input-size');

   const handlerChange = () => {
      const totalPrice = calculateTotalPrice(formMakeAdd, +makeInputStartPrice.value);
      makeTotalPrise.innerHTML = `${totalPrice}&nbsp;₽`;
      makeInputPrice.value = totalPrice;
   }

   formMakeAdd.addEventListener('change', handlerChange);
   formControl(formMakeAdd, () => {
      modalAdd.closest('close');
   })

   const filInForm = data => {
      makeTitle.textContent = data.ttile;
      makeInputTitle.value = data.title;
      makeTotalPrise.innerHTML = `${data.price}&nbsp;₽`;
      makeInputStartPrice.value = data.price;
      makeInputPrice.value = data.price;
      makeTotalSize.textContent = data.size;
      make_InputSize.value = data.size;
      handlerChange();
   }

   const resetForm = () => {
      makeTitle.textContent = '';
      makeTotalPrise.textContent = '';
      makeTotalSize.textContent = '';

      formMakeAdd.reset();
   }

   return {filInForm, resetForm};
}

const init = async () => {
   modalController({
      modal: '.modal_order',
      btnOpen: '.header_btn-order',
   });

   const {resetForm: resetFormOun} = calculateOun();

   modalController({
      modal: ".modal_make",
      btnOpen: '.coktail__btn',
      close: resetFormOun,
   });

   const goodsListElem = document.querySelector('.goods__list');
   const data = await getData();

   const cardsCiktail = data.map((item) => {
      const li = document.createElement('li');
      li.classList.add('goods__item');
      li.append(createCard(item));
      return li;
   });

   goodsListElem.append(...cardsCiktail);

   const {filInForm, resetForm} = calculateAdd();

   modalController({
      modal: ".modal_make-add",
      btnOpen: '.coktail__btn_add',
      open({btn}) {
         const id = btn.dataset.id;
         const item =data.find(item => item.id.toString() === id);
         filInForm(item);
      },
      closw: resetForm,
   });

};

init();