document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const textInput = document.getElementById("text-input")
  const fontFamily = document.getElementById("font-family")
  const fontSize = document.getElementById("font-size")
  const fontSizeValue = fontSize.nextElementSibling
  const inkColor = document.getElementById("ink-color")
  const lineHeight = document.getElementById("line-height")
  const lineHeightValue = lineHeight.nextElementSibling
  const letterSpacing = document.getElementById("letter-spacing")
  const letterSpacingValue = letterSpacing.nextElementSibling
  const pageSize = document.getElementById("page-size")
  const pageEffect = document.getElementById("page-effect")
  const paperOptions = document.querySelectorAll(".paper-option")
  const customFontRow = document.getElementById("custom-font-row")
  const customPaperRow = document.getElementById("custom-paper-row")
  const customFontInput = document.getElementById("custom-font")
  const customPaperInput = document.getElementById("custom-paper")
  const generateBtn = document.getElementById("generate-btn")
  const handwritingOutput = document.getElementById("handwriting-output")
  const outputContainer = document.getElementById("output-container")
  const previewPanel = document.getElementById("preview-panel")
  const downloadBtn = document.getElementById("download-btn")
  const copyBtn = document.getElementById("copy-btn")
  const clearTextBtn = document.getElementById("clear-text-btn")
  const resetOptionsBtn = document.getElementById("reset-options-btn")
  const themeToggleBtn = document.getElementById("theme-toggle-btn")

  // State
  let currentPaper = "default"
  let customFontUrl = ""
  let customPaperUrl = ""
  let isDarkMode = false
  const html2canvasLoaded = false

  // Initialize
  updateTextInputStyle()
  previewPanel.style.display = "none"

  // Event Listeners
  fontFamily.addEventListener("change", function () {
    if (this.value === "custom") {
      customFontRow.style.display = "flex"
    } else {
      customFontRow.style.display = "none"
    }
    updateTextInputStyle()
  })

  // Create font previews
  function createFontPreviews() {
    const fontPreviewContainer = document.createElement("div")
    fontPreviewContainer.className = "font-preview-row"
    fontPreviewContainer.id = "font-preview-container"

    const fonts = [
      { name: "Homemade Apple", class: "font-preview-homemade-apple", sample: "Handwriting" },
      { name: "Caveat", class: "font-preview-caveat", sample: "Handwriting" },
      { name: "Indie Flower", class: "font-preview-indie-flower", sample: "Handwriting" },
      { name: "Dancing Script", class: "font-preview-dancing-script", sample: "Handwriting" },
      { name: "Shadows Into Light", class: "font-preview-shadows-into-light", sample: "Handwriting" },
      { name: "Architects Daughter", class: "font-preview-architects-daughter", sample: "Handwriting" },
      { name: "Kalam", class: "font-preview-kalam", sample: "Handwriting" },
      { name: "Satisfy", class: "font-preview-satisfy", sample: "Handwriting" },
      { name: "Pacifico", class: "font-preview-pacifico", sample: "Handwriting" },
      { name: "Poppins", class: "font-preview-poppins", sample: "Humanized Text" },
    ]

    fonts.forEach((font) => {
      const preview = document.createElement("div")
      preview.className = "font-preview"
      preview.dataset.font = font.name
      preview.innerHTML = `<span class="${font.class}">${font.sample}</span>`

      preview.addEventListener("click", function () {
        fontFamily.value = font.name
        document.querySelectorAll(".font-preview").forEach((p) => p.classList.remove("active"))
        this.classList.add("active")
        updateTextInputStyle()
      })

      fontPreviewContainer.appendChild(preview)
    })

    // Insert after the font family dropdown
    const fontFamilyRow = fontFamily.closest(".option-row")
    fontFamilyRow.parentNode.insertBefore(fontPreviewContainer, fontFamilyRow.nextSibling)

    // Set the initial active preview
    const initialFont = fontFamily.value
    const initialPreview = document.querySelector(`.font-preview[data-font="${initialFont}"]`)
    if (initialPreview) {
      initialPreview.classList.add("active")
    }
  }

  // Call the function to create font previews
  createFontPreviews()

  fontSize.addEventListener("input", function () {
    fontSizeValue.textContent = `${this.value}px`
    updateTextInputStyle()
  })

  inkColor.addEventListener("input", updateTextInputStyle)

  lineHeight.addEventListener("input", function () {
    lineHeightValue.textContent = this.value
    updateTextInputStyle()
  })

  letterSpacing.addEventListener("input", function () {
    letterSpacingValue.textContent = `${this.value}px`
    updateTextInputStyle()
  })

  pageEffect.addEventListener("change", () => {
    updatePaperBackground()
  })

  paperOptions.forEach((option) => {
    option.addEventListener("click", function () {
      paperOptions.forEach((opt) => opt.classList.remove("active"))
      this.classList.add("active")
      currentPaper = this.dataset.paper

      if (currentPaper === "custom") {
        customPaperRow.style.display = "flex"
      } else {
        customPaperRow.style.display = "none"
      }

      updatePaperBackground()
    })
  })

  // Set default paper option as active
  document.querySelector('[data-paper="default"]').classList.add("active")

  customFontInput.addEventListener("change", function () {
    if (this.files.length > 0) {
      const file = this.files[0]
      this.nextElementSibling.nextElementSibling.textContent = file.name

      const formData = new FormData()
      formData.append("font", file)

      fetch("/upload-font", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            customFontUrl = data.path

            // Create a style element to load the custom font
            const style = document.createElement("style")
            style.textContent = `
                        @font-face {
                            font-family: 'CustomFont';
                            src: url('${customFontUrl}') format('truetype');
                            font-weight: normal;
                            font-style: normal;
                        }
                    `
            document.head.appendChild(style)

            // Update the text input style
            updateTextInputStyle()
          }
        })
        .catch((error) => {
          console.error("Error uploading font:", error)
        })
    }
  })

  customPaperInput.addEventListener("change", function () {
    if (this.files.length > 0) {
      const file = this.files[0]
      this.nextElementSibling.nextElementSibling.textContent = file.name

      const formData = new FormData()
      formData.append("paper", file)

      fetch("/upload-paper", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            customPaperUrl = data.path
            updatePaperBackground()
          }
        })
        .catch((error) => {
          console.error("Error uploading paper:", error)
        })
    }
  })

  generateBtn.addEventListener("click", generateHandwriting)

  downloadBtn.addEventListener("click", downloadImage)

  copyBtn.addEventListener("click", copyToClipboard)

  clearTextBtn.addEventListener("click", () => {
    textInput.value = ""
  })

  resetOptionsBtn.addEventListener("click", resetOptions)

  themeToggleBtn.addEventListener("click", toggleTheme)

  // Functions
  function updateTextInputStyle() {
    let fontFamilyValue

    if (fontFamily.value === "custom" && customFontUrl) {
      fontFamilyValue = "CustomFont"
    } else {
      fontFamilyValue = fontFamily.value
    }

    textInput.style.fontFamily = fontFamilyValue
    textInput.style.fontSize = `${fontSize.value}px`
    textInput.style.color = inkColor.value
    textInput.style.lineHeight = lineHeight.value
    textInput.style.letterSpacing = `${letterSpacing.value}px`
  }

  function updatePaperBackground() {
    let backgroundClass = ""

    switch (currentPaper) {
      case "default":
        backgroundClass = "default-paper"
        break
      case "ruled":
        backgroundClass = "ruled-paper"
        break
      case "grid":
        backgroundClass = "grid-paper"
        break
      case "custom":
        if (customPaperUrl) {
          textInput.parentElement.style.backgroundImage = `url('${customPaperUrl}')`
          textInput.parentElement.style.backgroundSize = "cover"
          return
        }
        break
    }

    // Reset background image if not custom
    if (currentPaper !== "custom") {
      textInput.parentElement.style.backgroundImage = ""
      textInput.parentElement.style.backgroundSize = ""
    }

    // Apply paper class
    textInput.parentElement.className = "paper-background"
    if (backgroundClass) {
      textInput.parentElement.classList.add(backgroundClass)
    }

    // Apply effect
    const effectClass = `${pageEffect.value}-effect`
    if (pageEffect.value !== "none") {
      textInput.parentElement.classList.add(effectClass)
    }
  }

  function generateHandwriting() {
    if (!textInput.value.trim()) {
      alert("Please enter some text first.")
      return
    }

    // Show preview panel
    previewPanel.style.display = "block"

    // Clone the text input style to the output
    handwritingOutput.style.fontFamily = textInput.style.fontFamily
    handwritingOutput.style.fontSize = textInput.style.fontSize
    handwritingOutput.style.color = textInput.style.color
    handwritingOutput.style.lineHeight = textInput.style.lineHeight
    handwritingOutput.style.letterSpacing = textInput.style.letterSpacing

    // Set the page size
    switch (pageSize.value) {
      case "a4":
        outputContainer.style.width = "210mm"
        outputContainer.style.height = "297mm"
        break
      case "letter":
        outputContainer.style.width = "8.5in"
        outputContainer.style.height = "11in"
        break
      case "legal":
        outputContainer.style.width = "8.5in"
        outputContainer.style.height = "14in"
        break
    }

    // Apply paper background
    handwritingOutput.className = ""

    switch (currentPaper) {
      case "default":
        handwritingOutput.classList.add("default-paper")
        break
      case "ruled":
        handwritingOutput.classList.add("ruled-paper")
        break
      case "grid":
        handwritingOutput.classList.add("grid-paper")
        break
      case "custom":
        if (customPaperUrl) {
          handwritingOutput.style.backgroundImage = `url('${customPaperUrl}')`
          handwritingOutput.style.backgroundSize = "cover"
        }
        break
    }

    // Apply effect
    if (pageEffect.value !== "none") {
      handwritingOutput.classList.add(`${pageEffect.value}-effect`)
    }

    // Set the text content
    handwritingOutput.innerHTML = textInput.value.replace(/\n/g, "<br>")

    // Scroll to the preview
    previewPanel.scrollIntoView({ behavior: "smooth" })
  }

  function downloadImage() {
    if (!handwritingOutput.innerHTML) {
      alert("Please generate handwriting first.")
      return
    }

    if (!html2canvasLoaded) {
      alert("html2canvas is still loading. Please try again in a moment.")
      return
    }

    // Use html2canvas to convert the output to an image
    html2canvas(handwritingOutput).then((canvas) => {
      const link = document.createElement("a")
      link.download = "handwriting.png"
      link.href = canvas.toDataURL("image/png")
      link.click()
    })
  }

  function copyToClipboard() {
    if (!handwritingOutput.innerHTML) {
      alert("Please generate handwriting first.")
      return
    }

    if (!html2canvasLoaded) {
      alert("html2canvas is still loading. Please try again in a moment.")
      return
    }

    // Use html2canvas to convert the output to an image
    html2canvas(handwritingOutput).then((canvas) => {
      canvas.toBlob((blob) => {
        const item = new ClipboardItem({ "image/png": blob })
        navigator.clipboard
          .write([item])
          .then(() => {
            alert("Image copied to clipboard!")
          })
          .catch((err) => {
            console.error("Error copying to clipboard:", err)
            alert("Failed to copy to clipboard. Please try again.")
          })
      })
    })
  }

  function resetOptions() {
    fontFamily.value = "Homemade Apple"
    fontSize.value = "16"
    fontSizeValue.textContent = "16px"
    inkColor.value = "#1a237e"
    lineHeight.value = "1.5"
    lineHeightValue.textContent = "1.5"
    letterSpacing.value = "0"
    letterSpacingValue.textContent = "0px"
    pageSize.value = "a4"
    pageEffect.value = "none"

    // Reset paper options
    paperOptions.forEach((opt) => opt.classList.remove("active"))
    document.querySelector('[data-paper="default"]').classList.add("active")
    currentPaper = "default"

    // Reset font preview selection
    document.querySelectorAll(".font-preview").forEach((p) => p.classList.remove("active"))
    const defaultFontPreview = document.querySelector('.font-preview[data-font="Homemade Apple"]')
    if (defaultFontPreview) {
      defaultFontPreview.classList.add("active")
    }

    // Hide custom rows
    customFontRow.style.display = "none"
    customPaperRow.style.display = "none"

    // Reset file inputs
    customFontInput.value = ""
    customPaperInput.value = ""
    customFontInput.nextElementSibling.nextElementSibling.textContent = "No file chosen"
    customPaperInput.nextElementSibling.nextElementSibling.textContent = "No file chosen"

    // Reset custom URLs
    customFontUrl = ""
    customPaperUrl = ""

    // Update styles
    updateTextInputStyle()
    updatePaperBackground()
  }

  function toggleTheme() {
    isDarkMode = !isDarkMode
    document.body.classList.toggle("dark", isDarkMode)

    // Update theme toggle icon
    const themeIcon = themeToggleBtn.querySelector("svg")
    if (isDarkMode) {
      themeIcon.innerHTML = `
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            `
    } else {
      themeIcon.innerHTML = `
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            `
    }
  }
})

// Add html2canvas library for image generation
document.addEventListener("DOMContentLoaded", () => {
  const script = document.createElement("script")
  script.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js"
  script.onload = () => {
    html2canvasLoaded = true
  }
  script.onerror = () => {
    console.error("Failed to load html2canvas.")
  }
  document.head.appendChild(script)
})

