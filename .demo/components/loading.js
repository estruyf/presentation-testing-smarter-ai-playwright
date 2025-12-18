import {
  css,
  html,
  LitElement
} from 'https://esm.run/lit';

/**
 * The `dt-loading` component displays animated loading dots with customizable properties:
 *
 * ```html title="Loading dots"
 * <dt-loading
 *   color="#007acc"
 *   size="8px"
 *   speed="1.4s">
 * </dt-loading>
 * ```
 *
 * Properties
 *
 * - `color`: Color of the loading dots (optional, defaults to #007acc)
 * - `size`: Size of each dot (optional, defaults to 8px)
 * - `speed`: Animation speed (optional, defaults to 1.4s)
 * - `count`: Number of dots (optional, defaults to 3)
 */
export class LoadingDots extends LitElement {
  static styles = css`
    .loading-container {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      min-width: 3em;
      font-family: monospace;
      font-size: var(--dot-size, 16px);
      color: var(--dot-color, #007acc);
    }

    .dot {
      display: inline-block;
      opacity: 0;
      animation: dot-sequence var(--animation-speed, 1.4s) ease-in-out infinite;
    }

    .dot:nth-child(1) { 
      animation-delay: 0s; 
    }
    .dot:nth-child(2) { 
      animation-delay: calc(var(--animation-speed, 1.4s) / 3); 
    }
    .dot:nth-child(3) { 
      animation-delay: calc(var(--animation-speed, 1.4s) / 3 * 2); 
    }

    @keyframes dot-sequence {
      0%, 25% {
        opacity: 0;
      }
      33%, 66% {
        opacity: 1;
      }
      75%, 100% {
        opacity: 0;
      }
    }
  `;

  static properties = {
    color: { type: String },
    size: { type: String },
    speed: { type: String },
    count: { type: Number }
  };

  constructor() {
    super();
    this.color = '#000';
    this.size = '8px';
    this.speed = '1.4s';
    this.count = 3;
  }

  render() {
    const style = {
      '--dot-color': this.color,
      '--dot-size': this.size,
      '--animation-speed': this.speed
    };

    return html`
      <div class="loading-container" style=${Object.entries(style).map(([k,v]) => v ? `${k}:${v}` : '').join(';')}>
        <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
      </div>
    `;
  }
}

customElements.define('dt-loading', LoadingDots);