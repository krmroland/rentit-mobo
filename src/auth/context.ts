import React from 'react';

import { AuthType } from './types';

const context = React.createContext<AuthType | null>(null);

export default context;
