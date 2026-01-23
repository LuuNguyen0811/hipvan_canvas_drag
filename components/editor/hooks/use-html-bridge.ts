import { useEffect, useState, useCallback } from "react";

export function useHtmlBridge(
  html: string,
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  onElementSelect?: (element: any) => void
) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (doc) {
      const editingScript = `
        <script>
          document.addEventListener('mouseover', function(e) {
            const target = e.target;
            if (target !== document.body && target !== document.documentElement) {
              target.style.outline = '2px solid rgba(59, 130, 246, 0.5)';
              target.style.outlineOffset = '2px';
            }
          });
          
          document.addEventListener('mouseout', function(e) {
            const target = e.target;
            target.style.outline = '';
            target.style.outlineOffset = '';
          });
          
          document.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const target = e.target;
            window.parent.postMessage({
              type: 'elementSelected',
              tagName: target.tagName,
              className: target.className,
              id: target.id,
              textContent: target.textContent?.substring(0, 100)
            }, '*');
          });

          document.addEventListener('dblclick', function(e) {
            const target = e.target;
            if (target.contentEditable !== 'true') {
              target.contentEditable = 'true';
              target.focus();
              target.style.outline = '2px solid #3b82f6';
              
              target.addEventListener('blur', function() {
                target.contentEditable = 'false';
                target.style.outline = '';
                window.parent.postMessage({
                  type: 'elementEdited',
                  tagName: target.tagName,
                  textContent: target.textContent
                }, '*');
              }, { once: true });
            }
          });
        </script>
      `;

      const htmlWithScript = html.replace("</body>", `${editingScript}</body>`);

      doc.open();
      doc.write(htmlWithScript);
      doc.close();
      setIframeLoaded(true);
    }
  }, [html, iframeRef]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "elementSelected") {
        onElementSelect?.(event.data);
      } else if (event.data.type === "elementEdited") {
        console.log("Element edited:", event.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onElementSelect]);

  const handleRefresh = useCallback(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html, iframeRef]);

  return {
    iframeLoaded,
    handleRefresh,
  };
}
