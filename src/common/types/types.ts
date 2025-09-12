import React from 'react';

export interface KeyValueObj {
  [key: string]: string;
}

export type ChildProp = {
  children: string | React.ReactNode;
};
