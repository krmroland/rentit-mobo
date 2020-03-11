import React from 'react';

const context = React.createContext({ auth: { user: {}, token: '', currenAccount: {} } });

export default context;
