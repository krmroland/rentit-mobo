import React from 'react';
import Echo from 'laravel-echo';
import socketIo from 'socket.io-client';
import { AuthContext } from '@/app/auth';

export default () => {
  const { accounts, user, token } = React.useContext(AuthContext);

  const echo = new Echo({
    broadcaster: 'socket.io',
    client: socketIo,

    host: 'http://localhost:6001/',
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  echo.connector.socket.on('connect', function() {
    console.log('connected', echo.socketId());
  });

  echo.connector.socket.on('disconnect', function() {
    console.log('disconnected');
  });

  echo.connector.socket.on('reconnecting', function(attemptNumber) {
    console.log('reconnecting', attemptNumber);
  });

  React.useEffect(() => {
    // we probably don't want to do anything if we have no token
    if (!user || !token) {
      return;
    }

    echo.private(`AccountData.User.${user.id}}`).listen('.account.new-data-event', e => {
      console.log('----------------->', e);
    });
    //clean up alittle bit
  }, [user]);
};
