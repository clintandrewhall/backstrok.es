/* global window */

const popup = openUrl => {
  const windowArea = {
    width: Math.floor(window.outerWidth * 0.8),
    height: Math.floor(window.outerHeight * 0.5),
  };

  if (windowArea.width < 1000) {
    windowArea.width = 1000;
  }
  if (windowArea.height < 630) {
    windowArea.height = 630;
  }
  windowArea.left = Math.floor(
    window.screenX + (window.outerWidth - windowArea.width) / 2,
  );
  windowArea.top = Math.floor(
    window.screenY + (window.outerHeight - windowArea.height) / 8,
  );

  const sep = openUrl.indexOf('?') !== -1 ? '&' : '?';
  const url = `${openUrl}${sep}`;
  const windowOpts = `toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0,
    width=${windowArea.width},height=${windowArea.height},
    left=${windowArea.left},top=${windowArea.top}`;

  const authWindow = window.open(url, 'backstrokesPopup', windowOpts);
  // Create IE + others compatible event handler
  const eventMethod = window.addEventListener
    ? 'addEventListener'
    : 'attachEvent';
  const eventer = window[eventMethod];
  const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';

  // Listen to message from child window
  const authPromise = new Promise((resolve, reject) => {
    eventer(
      messageEvent,
      msg => {
        if (
          !~msg.origin.indexOf(
            `${window.location.protocol}//${window.location.host}`,
          )
        ) {
          authWindow.close();
          reject('Not allowed');
        }

        if (msg.data.auth) {
          resolve(JSON.parse(msg.data.auth));
          authWindow.close();
        } else {
          authWindow.close();
          reject('Unauthorized');
        }
      },
      false,
    );
  });

  return authPromise;
};

export default popup;