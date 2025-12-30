import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from './components/ui/button';

class SwalModal extends React.Component {
  state = { visible: false, options: {} };

  componentDidMount() {
    window.__swalShow = this.show;
  }

  show = (options) => this.setState({ visible: true, options });
  close = (result) => {
    this.setState({ visible: false });
    window.__swalResolve?.(result);
  };

  handleConfirm = () => this.close({ isConfirmed: true });
  handleCancel = () => this.close({ isConfirmed: false, isDismissed: true, dismiss: 'cancel' });

render() {
  if (!this.state.visible) return null;
  const { title, text, html, icon, showCancelButton = false } = this.state.options;

  let IconComponent = null;
  let iconColor = '#fff';
  let bgColor = '#f8f9fa';
  let buttonBg = '#2c3e50';
  let buttonColor = 'white';

  if (icon === 'success') {
    IconComponent = require('lucide-react').Check;
    bgColor = '#10b981';
    buttonBg = '#10b981';
  } else if (icon === 'warning') {
    IconComponent = require('lucide-react').AlertTriangle;
    bgColor = '#f59e0b';
    buttonBg = '#f59e0b';
  } else if (icon === 'error') {
    IconComponent = require('lucide-react').X;
    bgColor = '#ef4444';
    buttonBg = '#ef4444';
  } else if (icon === 'info') {
    IconComponent = require('lucide-react').Info;
    bgColor = '#3b82f6';
    buttonBg = '#3b82f6';
  }

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
      onClick={this.handleCancel}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '24px 24px 24px 24px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            zIndex: 10
          }}
        >
          {IconComponent && <IconComponent size={50} strokeWidth={2} />}
        </div>

        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '1.25em',
            fontWeight: 600,
            color: '#333',
            paddingTop: '32px'
          }}
        >
          {title}
        </h3>

        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '0.95em',
            lineHeight: 1.5
          }}
          dangerouslySetInnerHTML={{ __html: html || text || '' }}
        />

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {showCancelButton && (
            <Button variant="outline" size="sm" onClick={this.handleCancel}>
              Отмена
            </Button>
          )}
          <Button
            size="sm"
            onClick={this.handleConfirm}
          >
            Продолжить
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
}

function normalizeOptions(options) {
  if (options && typeof options === 'object' && !Array.isArray(options)) {
    if ('0' in options && typeof options[0] === 'string') {
      return {
        title: options[0] || '',
        text: options[1] || '',
        icon: options[2] || ''
      };
    }
    return { ...options };
  }
  if (typeof options === 'string') {
    return { title: options };
  }
  return {};
}

function fire(options) {
  const normalized = normalizeOptions(options);
  return new Promise(resolve => {
    window.__swalResolve = resolve;
    window.__swalShow?.(normalized);
  });
}

const Swal = { fire, Modal: SwalModal };
Swal.default = Swal;
window.swal = fire;

export { Swal as default, fire as swal };
