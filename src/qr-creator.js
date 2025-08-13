import QRCode from "qrcode";

document.addEventListener("DOMContentLoaded", qrCreator_DOMContentLoaded);

function qrCreator_DOMContentLoaded() {
  const qrSettingsContainer = document.getElementById("qr-settings");
  const qrTextInput = document.getElementById("qr-text-input");
  const qrErrorCorrectionSelect = document.getElementById(
    "qr-error-correction"
  );
  const qrBackgourndColorInput = document.getElementById("qr-background-color");
  const qrForegroundColorInput = document.getElementById("qr-foreground-color");

  document
    .querySelectorAll("[data-ig-type='color']")
    .forEach(initColorInputGroup);

  qrSettingsContainer.addEventListener(
    "change",
    function onSettingsChange(event) {
      generateQrCode();
    }
  );

  const qrOutputWrapper = document.querySelector(".qr-output-wrapper");
  const qrDownloadFormatSelect = document.getElementById("qr-download-format");
  const qrDownloadBtn = document.getElementById("qr-download-btn");
  const qrPreviewCanvas = document.getElementById("qr-preview");

  qrDownloadBtn.addEventListener("click", function qrDownloadBtnDown(event) {
    const filename = "qrcode";
    const requestedFormat = qrDownloadFormatSelect.value;
    const dataUrl = qrPreviewCanvas.toDataURL(requestedFormat);

    // skip "data:" and grab everything up to and excluding ";";
    const receivedFormat = dataUrl.substring(5, dataUrl.indexOf(";"));
    if (requestedFormat !== receivedFormat) {
      console.warn(
        `Requested format ${requestedFormat} cannot be generated with this browser. Defaulting to ${receivedFormat}`
      );
    }

    let fileExtension;
    if (receivedFormat === "image/png") {
      fileExtension = "png";
    } else if (receivedFormat === "image/webp") {
      fileExtension = "webp";
    } else if (receivedFormat === "image/jpeg") {
      fileExtension = "jpg";
    } else if (receivedFormat === "image/tiff") {
      fileExtension = "tif";
    } else if (receivedFormat === "image/gif") {
      fileExtension = "gif";
    } else {
      throw new Error(`Unknown image format ${receivedFormat}`);
    }

    const link = document.createElement("a");
    link.download = `${filename}.${fileExtension}`;
    link.href = dataUrl;
    link.click();
  });

  function generateQrCode() {
    qrOutputWrapper.style.backgroundColor = qrBackgourndColorInput.value;

    if (!qrTextInput.value) {
      console.error(`Invalid URL: ${qrTextInput.value}`);
      return;
    }

    const options = {
      errorCorrectionLevel: qrErrorCorrectionSelect.value,
      // version: 2, // 1-40
      // scale: 4, // pixles per module
      // width: // overrides scale
      color: {
        light: qrBackgourndColorInput.value,
        dark: qrForegroundColorInput.value,
      },
    };

    // TODO(jw): download button; hide/show loading
    qrOutputWrapper.classList.toggle("hidden", true);

    QRCode.toCanvas(
      qrPreviewCanvas,
      qrTextInput.value,
      options,
      function qrToCanvasError(error) {
        qrOutputWrapper.classList.toggle("hidden", false);

        if (error) {
          console.error(error);
        } else {
          console.log("qr success");
        }
      }
    );
  }

  generateQrCode();
}

/**
 * Hydrates a color input group element. The group element should have the
 * following children:
 * - <input type="text">
 * - <input type="color">
 *
 * If there is a default value it should be placed on the color input element.
 *
 * @param {HTMLElement} groupElement
 */
function initColorInputGroup(groupElement) {
  const textInput = groupElement.querySelector("input[type='text']");
  const colorInput = groupElement.querySelector("input[type='color']");

  textInput.value = colorInput.value;

  textInput.addEventListener("input", function colorTextInputInput() {
    const normalizedColorValue = normalizeHexColor(textInput.value);
    if (normalizedColorValue) {
      colorInput.value = normalizedColorValue;
    }
  });
  textInput.addEventListener("change", function colorTextInputChange() {
    const normalizedColorValue = normalizeHexColor(textInput.value);
    if (normalizedColorValue) {
      colorInput.value = normalizedColorValue;
    } else {
      textInput.value = colorInput.value;
    }
  });

  function updateTextValue() {
    const normalizeTextValue = normalizeHexColor(textInput.value);
    if (normalizeHexColor !== colorInput.value) {
      textInput.value = colorInput.value;
    }
  }
  colorInput.addEventListener("input", updateTextValue);
  colorInput.addEventListener("change", updateTextValue);
}

/**
 * Takes a string representing a RGB (no alpha) color in hexadecimal form.
 * The normalized form is lower case and always includes a leading '#'.
 *
 * @param {string} hexColor
 * @returns {?string} the normalized hexadecimal color or `null` if `hexColor` is invalid
 */
function normalizeHexColor(hexColor) {
  hexColor = hexColor.trim();
  const match = hexColor.match(/^#?[a-fA-F0-9]{6}$/);
  if (!match) {
    return null;
  }

  hexColor = match[0].toLowerCase();
  if (hexColor.charAt(0) !== "#") {
    return `#${hexColor}`;
  }

  return hexColor;
}
