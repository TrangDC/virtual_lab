// script.js - Final Fix for Deleting Logic

const labManager = {
    container: document.getElementById('simulation-container'),
    hoveredElement: null, 

    init: function() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (this.hoveredElement) {
                    this.removeItem(this.hoveredElement);
                }
            }
        });
    },

    clearAll: function() {
        this.container.innerHTML = '';
        this.hoveredElement = null;
    },

    removeItem: function(element) {
        if (!element) return;
        
        // --- LOGIC XÓA ĐA NĂNG ---
        
        // 1. Bình Chlorine (Dựa vào flaskRef)
        if (element.flaskRef) { 
            const instance = element.flaskRef;
            if (instance.bodyEl) instance.bodyEl.remove();
            if (instance.capEl) instance.capEl.remove();
        } 
        // 2. Bình Natri (Dựa vào sodiumRef - Cần update sodium.js tương tự lamp.js)
        else if (element.sodiumRef) {
             const instance = element.sodiumRef;
             if (instance.bodyEl) instance.bodyEl.remove();
             if (instance.capEl) instance.capEl.remove();
             if (instance.labelEl) instance.labelEl.remove();
        }
        // 3. Đèn Cồn (Dựa vào lampRef - Mới thêm)
        else if (element.lampRef) {
            const instance = element.lampRef;
            if (instance.bodyEl) instance.bodyEl.remove();
            if (instance.capEl) instance.capEl.remove();
        }
        // 4. Vật dụng đơn lẻ (Muỗng, Dây sắt...)
        else {
            element.remove();
        }

        this.hoveredElement = null;
    },

    registerItemEvents: function(element) {
        element.classList.add('lab-item');
        
        element.addEventListener('mouseenter', () => {
            this.hoveredElement = element;
        });

        element.addEventListener('mouseleave', () => {
            if (this.hoveredElement === element) {
                this.hoveredElement = null;
            }
        });
    },

    addItem: function(type) {
        let instance = null;
        let mainElements = []; 

        switch(type) {
            case 'alcohol-lamp':
                instance = new AlcoholLamp(this.container);
                // Đèn cồn có 2 phần: bodyEl và capEl
                mainElements.push(instance.bodyEl);
                mainElements.push(instance.capEl);
                break;

            case 'chemical-spoon': 
                instance = new ChemicalSpoon(this.container);
                // Muỗng thường chỉ có 1 element chính (tùy vào code spoon.js của bạn)
                // Nếu spoon.js gán this.element = ... thì dùng dòng này:
                if (instance.element) mainElements.push(instance.element);
                break;
            
            case 'iron-wire': 
                instance = new IronWire(this.container);
                if (instance.element) mainElements.push(instance.element);
                break;

            case 'chlorine-flask':
                instance = new ChlorineFlask(this.container);
                mainElements.push(instance.bodyEl);
                mainElements.push(instance.capEl);
                break;

            case 'sodium-jar':
                instance = new SodiumJar(this.container);
                if(instance.bodyEl) mainElements.push(instance.bodyEl);
                if(instance.capEl) mainElements.push(instance.capEl);
                if(instance.labelEl) mainElements.push(instance.labelEl);
                break;            

            default:
                console.warn('Chưa hỗ trợ dụng cụ:', type);
                return;
        }

        mainElements.forEach(el => {
            if(el) this.registerItemEvents(el);
        });
    }
};

labManager.init();

document.querySelectorAll('.library-item').forEach(item => {
    item.addEventListener('click', () => {
        const type = item.getAttribute('data-item');
        if (type && !item.classList.contains('disabled')) {
            labManager.addItem(type);
        }
    });

    item.addEventListener('dragstart', (e) => {
        const type = item.getAttribute('data-item');
        if(type) e.dataTransfer.setData('text/plain', type);
    });
});