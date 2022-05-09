export default class NotificationMessage {
    constructor (message, { duration = 1000, type = 'success' } = {})
    {
      this._checkInstance();
  
      this.message = message;
      this.duration = duration;
      this.type = type;
      this._render();
  
      NotificationMessage.current = this;
    }
  
    _checkInstance() {
      if (NotificationMessage.current) {
        NotificationMessage.current.destroy();
      }
    }
  
    _render () {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = 
      `<div class="notification ${this.type}" style="--value:${Math.floor(this.duration / 1000)}s">
          <div class="timer"></div>
          <div class="inner-wrapper">
              <div class="notification-header">${this.type}</div>
              <div class="notification-body">
                  ${this.message}
              </div>
          </div>
      </div>`;
  
      this.element = wrapper.firstChild;
    }
  
    show (element) {
      if (element) {
        element.append(this.element);
      } else {
        document.body.prepend(this.element);
      }
      this.timeout = setTimeout(() => {
        this.remove();
      }, this.duration);
    }
  
    remove () {
      if (this.timeout) { 
        clearTimeout(this.timeout); 
      }
      this.element?.remove();
    }
  
    destroy() {
      this.remove();
      this.element = null;
    }
  }
  