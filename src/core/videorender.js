import YUVBuffer from 'yuv-buffer';
import YUVCanvas from 'yuv-canvas';

export class VideoRender {
  constructor () {
    this._parent = null;
    this._contianer = null;
    this._canvas = null;

    this._render = null;
    this._format = null;
    this._frame = null;

    this._videoWidth = 0;
    this._videoHeight = 0;
  }

  /**
   * setView
   * @param {HTMLDivElement} parent 
   */
  setView (parent) {
    if (parent) {
      if (this._parent === parent) {
        return;
      }
      this.removeView();
      this._parent = parent;
      this._init();
    }
  }

  /**
   * clearRender and remvoeView
   */
  removeView () {
    if (this._canvas || this._contianer) {
      if (this._render) {
        this._render.clear();
      }
      this._render = null;
      this._format = null;

      this._removeElement(this._canvas);
      this._canvas = null;

      this._removeElement(this._contianer);
      this._contianer = null;
    }
    this._videoWidth = 0;
    this._videoHeight = 0;
    this._parent = null;
  }

  /**
   * clearRender
   */
  clearRender () {
    if (this._render) {
      this._render.clear();
    }
    this._render = null;
  }

  /**
   * drawYUVData
   * @param {Object} data 
   * @param {number} data.width
   * @param {number} data.height
   * @param {ArrayBuffer} data.data_y
   * @param {ArrayBuffer} data.data_u
   * @param {ArrayBuffer} data.data_v
   */
  updateRender (data) {
    if (!this._parent || !this._contianer || !this._canvas || this._parent.style.display == 'none') {
      return;
    }

    let bForceChange = false;
    if (0 == this._videoWidth || 0 == this._videoHeight) {
      this._videoWidth = data.width;
      this._videoHeight = data.height;
    } else if (this._videoWidth != data.width || this._videoHeight != data.height) {
      this._videoWidth = data.width;
      this._videoHeight = data.height;
      bForceChange = true;
      this._render = null;
      this._format = null;
    }
    this._drawFrame(bForceChange, data);
  }

  _drawFrame (bForceChange, data) {
    if (this._resize(bForceChange)) {
      // return;
    }

    if (this._videoWidth && this._videoHeight && this._canvas && (data || this._frame)) {
      this._format = YUVBuffer.format({
        width: this._videoWidth,
        height: this._videoHeight,
        chromaWdith: Math.floor(this._videoWidth * 0.5),
        chromaHeight: Math.floor(this._videoHeight * 0.5),
        displayWidth: this._canvas.width,
        displayHeight: this._canvas.height
      })

      if (!this._render || bForceChange) {
        this._render = YUVCanvas.attach(this._canvas);
      }

      try {
        if (data) {
          this._frame = YUVBuffer.frame (
            this._format, 
            YUVBuffer.lumaPlane(this._format, data.data_y), 
            YUVBuffer.chromaPlane(this._format, data.data_u),
            YUVBuffer.chromaPlane(this._format, data.data_v)
          );
        }
        this._render.drawFrame(this._frame);
      } catch (err) {
        console.error('render error', err);
        this._reset();
      }
    }

  }

  _init () {
    this._contianer = document.createElement('div');
    this._contianer.style.width = '100%';
    this._contianer.style.height = '100%';
    this._contianer.style.display = 'flex';
    this._contianer.style.justifyContent = 'center';
    this._contianer.style.alignItems = 'center';
    this._parent.appendChild(this._contianer);
    this._canvas = document.createElement('canvas');
    this._contianer.appendChild(this._canvas);
  }

  _removeElement (element) {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  }

  _resize (bForceChange) {
    if (!bForceChange && (
      Math.abs(this._contianer.clientWidth - this._canvas.width) <= 5 ||
      Math.abs(this._contianer.clientHeight - this._canvas.height) <= 5
    )) {
      return false;
    }

    let aspectRatio = this._videoWidth / this._videoHeight;
    this._aspectRatio = this._contianer.clientWidth / this._contianer.clientHeight;

    if (this._aspectRatio >= aspectRatio) {
      this._canvas.height = this._contianer.clientHeight;
      this._canvas.width = this._canvas.height * aspectRatio;
    } else {
      this._canvas.width = this._contianer.clientWidth;
      this._canvas.height = this._canvas.width / aspectRatio;
    }

    if (this._videoWidth > 0 && this._videoHeight > 0) {
      this._format = YUVBuffer.format({
        width: this._videoWidth,
        height: this._videoHeight,
        chromaWdith: Math.floor(this._videoWidth * 0.5),
        chromaHeight: Math.floor(this._videoHeight * 0.5),
        displayWidth: this._canvas.width,
        displayHeight: this._canvas.height
      })
    }
    return true;
  }

  _reset () {
    if (this._render) {
      this._render.clear();
    }
    this._render = null;
  }
}