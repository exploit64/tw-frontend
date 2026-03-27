import { API } from "./constants";

export const inFlightFetches = new Map();

export const getCookie = (name) => {
  const match = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return match ? decodeURIComponent(match[1]) : undefined;
};

export const setCookie = (name, value, days) => {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; ${expires}; path=/`;
};

export const copyToClipboard = (text) => {
  return new Promise((resolve, reject) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    try {
      document.execCommand("copy");
      document.body.removeChild(textarea);
      const notification = document.createElement("div");
      notification.textContent = "Скопировано";
      notification.style.cssText = `
        position: fixed;
        bottom: 16px;
        right: 24px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        z-index: 9999;
        font-size: 14px;
        font-weight: 600;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      const checkIcon = document.createElement("div");
      checkIcon.innerHTML = "✓";
      checkIcon.style.cssText = `
        width: 16px;
        height: 16px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      `;
      notification.appendChild(checkIcon);
      document.body.appendChild(notification);
      requestAnimationFrame(() => {
        notification.style.transform = "translateX(0)";
        notification.style.opacity = "1";
      });
      setTimeout(() => {
        notification.style.transform = "translateX(100%)";
        notification.style.opacity = "0";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
      resolve();
    } catch (err) {
      document.body.removeChild(textarea);
      reject(new Error("Не удалось скопировать текст"));
    }
  });
};

export const fetchJson = (url, options = {}) => {
  const key = `${url}::${JSON.stringify(options)}`;
  const token = localStorage.getItem("access_token");
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  if (inFlightFetches.has(key)) {
    return inFlightFetches.get(key);
  }
  const controller = new AbortController();
  const merged = {
    ...options,
    signal: controller.signal,
  };
  const promise = fetch(url, merged)
    .then((res) => {
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          window.location.href = "/tw/";
          throw new Error("Unauthorized");
        }
        const err = new Error(`Fetch error ${res.status} ${res.statusText}`);
        err.status = res.status;
        throw err;
      }
      return res.json();
    })
    .finally(() => {
      inFlightFetches.delete(key);
    });
  inFlightFetches.set(key, promise);
  return promise;
};

export const getDisplayNameFromParams = (params) => {
  if (!Array.isArray(params)) return undefined;
  for (const entry of params) {
    if (
      entry &&
      typeof entry === "object" &&
      Object.prototype.hasOwnProperty.call(entry, "DisplayName")
    ) {
      return entry.DisplayName;
    }
  }
  return undefined;
};

export const getEntityDisplayName = (entity) => {
  const displayName = getDisplayNameFromParams(entity?.params);
  if (displayName !== undefined) return String(displayName);
  return entity?.name;
};

export const groupByHierarchy = (items, getEpic, getFeature, getStory) => {
  const { ROOT_LABEL, ITEMS_KEY } = require("./constants");
  return items.reduce((acc, item) => {
    const levels = [getEpic(item), getFeature(item), getStory(item)];
    let current = acc;
    let found = false;
    for (const level of levels) {
      if (level) {
        const hasNextRealLevel = levels
          .slice(levels.indexOf(level) + 1)
          .some(Boolean);
        if (!current[level]) {
          current[level] = hasNextRealLevel ? {} : [];
        } else if (hasNextRealLevel && Array.isArray(current[level])) {
          const savedItems = current[level];
          current[level] = { [ITEMS_KEY]: savedItems };
        }
        current = current[level];
        found = true;
      }
    }
    if (!found) {
      if (!current[ROOT_LABEL]) {
        current[ROOT_LABEL] = [];
      }
      current[ROOT_LABEL].push(item);
    } else {
      if (Array.isArray(current)) {
        current.push(item);
      } else {
        current[ITEMS_KEY] = current[ITEMS_KEY] || [];
        current[ITEMS_KEY].push(item);
      }
    }
    return acc;
  }, {});
};

export const collectAllGroupNodeIds = (node, nodeId = "") => {
  const { ITEMS_KEY } = require("./constants");
  if (Array.isArray(node)) return [];
  let ids = [];
  Object.entries(node).forEach(([key, value]) => {
    if (key === ITEMS_KEY) return;
    const childNodeId = nodeId ? `${nodeId}-${key}` : key;
    ids.push(childNodeId);
    ids = ids.concat(collectAllGroupNodeIds(value, childNodeId));
  });
  return ids;
};

export const collectAllIds = (node, pageType = "tests") => {
  const { ITEMS_KEY } = require("./constants");
  if (Array.isArray(node))
    return node
      .map((n) => {
        const numberPart =
          pageType === "tests" && n?.template === true ? 1 : n?.number ?? 0;
        return n?.test_id ? `${numberPart}|${n.test_id}` : null;
      })
      .filter(Boolean);
  let ids = [];
  Object.values(node).forEach((v) => {
    ids.push(...collectAllIds(v, pageType));
  });
  return ids;
};

export function sha1Fallback(bytes) {
  function rotl(n, s) {
    return (n << s) | (n >>> (32 - s));
  }
  function toUint32(n) {
    return n >>> 0;
  }
  const ml = bytes.length * 8;
  const withOne = new Uint8Array(bytes.length + 1);
  withOne.set(bytes);
  withOne[bytes.length] = 0x80;
  let l = withOne.length;
  while (l % 64 !== 56) l++;
  const padded = new Uint8Array(l + 8);
  padded.set(withOne);
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, Math.floor(ml / 0x100000000));
  dv.setUint32(padded.length - 4, ml >>> 0);
  let h0 = 0x67452301,
    h1 = 0xefcdab89,
    h2 = 0x98badcfe,
    h3 = 0x10325476,
    h4 = 0xc3d2e1f0;
  const w = new Uint32Array(80);
  for (let i = 0; i < padded.length; i += 64) {
    for (let j = 0; j < 16; j++) w[j] = dv.getUint32(i + j * 4);
    for (let j = 16; j < 80; j++)
      w[j] = rotl(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4;
    for (let j = 0; j < 80; j++) {
      let f, k;
      if (j < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (j < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      const t = (rotl(a, 5) + f + e + k + w[j]) >>> 0;
      e = d;
      d = c;
      c = rotl(b, 30) >>> 0;
      b = a;
      a = t;
    }
    h0 = toUint32(h0 + a);
    h1 = toUint32(h1 + b);
    h2 = toUint32(h2 + c);
    h3 = toUint32(h3 + d);
    h4 = toUint32(h4 + e);
  }
  const out = new Uint8Array(20);
  const outDv = new DataView(out.buffer);
  outDv.setUint32(0, h0);
  outDv.setUint32(4, h1);
  outDv.setUint32(8, h2);
  outDv.setUint32(12, h3);
  outDv.setUint32(16, h4);
  return out;
}

export async function uuidv5(name, namespaceUuid) {
  const ns = namespaceUuid.replace(/-/g, "");
  const nsBytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++)
    nsBytes[i] = parseInt(ns.slice(i * 2, i * 2 + 2), 16);
  const encoder = new TextEncoder();
  const nameBytes = encoder.encode(name);
  const toHash = new Uint8Array(nsBytes.length + nameBytes.length);
  toHash.set(nsBytes, 0);
  toHash.set(nameBytes, nsBytes.length);
  let fullHash;
  if (window.crypto?.subtle?.digest) {
    const hashBuffer = await window.crypto.subtle.digest("SHA-1", toHash);
    fullHash = new Uint8Array(hashBuffer);
  } else {
    fullHash = sha1Fallback(toHash);
  }
  const hash = fullHash.slice(0, 16);
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = [...hash].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
    12,
    16
  )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
