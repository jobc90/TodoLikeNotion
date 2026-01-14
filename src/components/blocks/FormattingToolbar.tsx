"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface FormattingToolbarProps {
  onClose?: () => void;
}

type FormatType = "bold" | "italic" | "underline" | "strikethrough" | "code";

export default function FormattingToolbar({ onClose }: FormattingToolbarProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<FormatType>>(new Set());
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const toolbarRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const checkActiveFormats = useCallback(() => {
    const formats = new Set<FormatType>();

    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("underline")) formats.add("underline");
    if (document.queryCommandState("strikeThrough")) formats.add("strikethrough");

    // Check for code (using <code> tag)
    const selection = window.getSelection();
    if (selection && selection.anchorNode) {
      let node: Node | null = selection.anchorNode;
      while (node && node !== document.body) {
        if (node.nodeName === "CODE") {
          formats.add("code");
          break;
        }
        node = node.parentNode;
      }
    }

    setActiveFormats(formats);
  }, []);

  const updateToolbarPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setIsVisible(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Check if selection is empty
    if (rect.width === 0 && rect.height === 0) {
      setIsVisible(false);
      return;
    }

    // Check if selection is within a contentEditable element
    const container = range.commonAncestorContainer;
    const isEditable = container.nodeType === Node.TEXT_NODE
      ? (container.parentElement?.closest('[contenteditable="true"]') !== null)
      : (container as HTMLElement).closest('[contenteditable="true"]') !== null;

    if (!isEditable) {
      setIsVisible(false);
      return;
    }

    // Position toolbar above selection
    const toolbarHeight = 44;
    const toolbarWidth = showLinkInput ? 320 : 280;
    const spacing = 8;

    let x = rect.left + rect.width / 2;
    let y = rect.top - toolbarHeight - spacing;

    // Keep toolbar within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Horizontal boundaries
    if (x - toolbarWidth / 2 < 10) {
      x = toolbarWidth / 2 + 10;
    } else if (x + toolbarWidth / 2 > viewportWidth - 10) {
      x = viewportWidth - toolbarWidth / 2 - 10;
    }

    // Vertical boundaries - if not enough space above, show below
    if (y < 10) {
      y = rect.bottom + spacing;
    }

    setPosition({ x, y });
    setIsVisible(true);
    checkActiveFormats();
  }, [checkActiveFormats, showLinkInput]);

  const handleFormat = useCallback((format: FormatType) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Save selection
    const range = selection.getRangeAt(0);

    switch (format) {
      case "bold":
        document.execCommand("bold", false);
        break;
      case "italic":
        document.execCommand("italic", false);
        break;
      case "underline":
        document.execCommand("underline", false);
        break;
      case "strikethrough":
        document.execCommand("strikeThrough", false);
        break;
      case "code":
        // Toggle code formatting
        if (activeFormats.has("code")) {
          // Remove code formatting
          const code = range.commonAncestorContainer.parentElement;
          if (code && code.tagName === "CODE") {
            const textNode = document.createTextNode(code.textContent || "");
            code.parentNode?.replaceChild(textNode, code);
          }
        } else {
          // Wrap selection in <code> tag
          const code = document.createElement("code");
          try {
            range.surroundContents(code);
          } catch (e) {
            // If surroundContents fails, use a different approach
            const contents = range.extractContents();
            code.appendChild(contents);
            range.insertNode(code);
          }
        }
        break;
    }

    // Restore selection
    selection.removeAllRanges();
    selection.addRange(range);

    // Update active formats
    setTimeout(checkActiveFormats, 10);
  }, [activeFormats, checkActiveFormats]);

  const handleLink = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Check if already a link
    const range = selection.getRangeAt(0);
    let linkElement: HTMLAnchorElement | null = null;
    let node: Node | null = range.commonAncestorContainer;

    while (node && node !== document.body) {
      if (node.nodeName === "A") {
        linkElement = node as HTMLAnchorElement;
        break;
      }
      node = node.parentNode;
    }

    if (linkElement) {
      // Remove link
      const text = document.createTextNode(linkElement.textContent || "");
      linkElement.parentNode?.replaceChild(text, linkElement);
      setShowLinkInput(false);
      setLinkUrl("");
    } else {
      // Show link input
      setShowLinkInput(true);
      setLinkUrl("");
      setTimeout(() => linkInputRef.current?.focus(), 50);
    }
  }, []);

  const handleLinkSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !linkUrl.trim()) {
      setShowLinkInput(false);
      setLinkUrl("");
      return;
    }

    const range = selection.getRangeAt(0);
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    try {
      range.surroundContents(link);
    } catch (e) {
      const contents = range.extractContents();
      link.appendChild(contents);
      range.insertNode(link);
    }

    setShowLinkInput(false);
    setLinkUrl("");

    // Restore selection
    selection.removeAllRanges();
    selection.addRange(range);
  }, [linkUrl]);

  useEffect(() => {
    const handleSelectionChange = () => {
      // Delay to allow selection to stabilize
      setTimeout(updateToolbarPosition, 10);
    };

    const handleMouseUp = () => {
      handleSelectionChange();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Don't update on arrow keys
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        return;
      }
      handleSelectionChange();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            handleFormat("bold");
            break;
          case "i":
            e.preventDefault();
            handleFormat("italic");
            break;
          case "u":
            e.preventDefault();
            handleFormat("underline");
            break;
          case "e":
            // Cmd+E for code
            e.preventDefault();
            handleFormat("code");
            break;
          case "k":
            // Cmd+K for link
            e.preventDefault();
            handleLink();
            break;
        }
      }

      // Escape to close link input or toolbar
      if (e.key === "Escape") {
        if (showLinkInput) {
          setShowLinkInput(false);
          setLinkUrl("");
        } else {
          setIsVisible(false);
        }
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [updateToolbarPosition, handleFormat, handleLink, showLinkInput]);

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className="formatting-toolbar"
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
    >
      {!showLinkInput ? (
        <>
          <button
            className={`formatting-btn ${activeFormats.has("bold") ? "active" : ""}`}
            onClick={() => handleFormat("bold")}
            title="Bold (⌘B)"
            type="button"
          >
            <strong>B</strong>
          </button>

          <button
            className={`formatting-btn ${activeFormats.has("italic") ? "active" : ""}`}
            onClick={() => handleFormat("italic")}
            title="Italic (⌘I)"
            type="button"
          >
            <em>I</em>
          </button>

          <button
            className={`formatting-btn ${activeFormats.has("underline") ? "active" : ""}`}
            onClick={() => handleFormat("underline")}
            title="Underline (⌘U)"
            type="button"
          >
            <u>U</u>
          </button>

          <button
            className={`formatting-btn ${activeFormats.has("strikethrough") ? "active" : ""}`}
            onClick={() => handleFormat("strikethrough")}
            title="Strikethrough"
            type="button"
          >
            <s>S</s>
          </button>

          <div className="formatting-divider" />

          <button
            className={`formatting-btn ${activeFormats.has("code") ? "active" : ""}`}
            onClick={() => handleFormat("code")}
            title="Code (⌘E)"
            type="button"
          >
            &lt;/&gt;
          </button>

          <div className="formatting-divider" />

          <button
            className="formatting-btn"
            onClick={handleLink}
            title="Link (⌘K)"
            type="button"
          >
            ↗
          </button>
        </>
      ) : (
        <form onSubmit={handleLinkSubmit} className="formatting-link-form">
          <input
            ref={linkInputRef}
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Paste or type a link..."
            className="formatting-link-input"
            onBlur={() => {
              // Delay to allow submit button click
              setTimeout(() => {
                if (!linkUrl.trim()) {
                  setShowLinkInput(false);
                }
              }, 200);
            }}
          />
          <button
            type="submit"
            className="formatting-link-submit"
            disabled={!linkUrl.trim()}
          >
            ✓
          </button>
          <button
            type="button"
            className="formatting-link-cancel"
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl("");
            }}
          >
            ✕
          </button>
        </form>
      )}
    </div>
  );
}
