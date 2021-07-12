import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness5Icon from '@material-ui/icons/Brightness5';
import Brightness6Icon from '@material-ui/icons/Brightness6';
import Brightness7Icon from '@material-ui/icons/Brightness7';

export default function ToggleThemeMenu({ themeName, toggleTheme, t, className, style, size }) {
    return <div className={className || undefined} style={style || undefined}>
        <Tooltip title={t('Change color theme')}>
            <IconButton onClick={() => toggleTheme()} size={size || 'medium'}>
                {themeName === 'dark' && <Brightness4Icon className={className} />}
                {themeName === 'blue' && <Brightness5Icon className={className} />}
                {themeName === 'colored' && <Brightness6Icon className={className} />}
                {themeName === 'light' && <Brightness7Icon className={className} />}
            </IconButton>
        </Tooltip>
    </div>;
}