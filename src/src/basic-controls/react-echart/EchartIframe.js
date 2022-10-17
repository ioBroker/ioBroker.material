import React from 'react';
import PropTypes from 'prop-types';
import cls from './style.module.scss';
import I18n from '@iobroker/adapter-react-v5/i18n';
import echartsImg from '../../assets/echarts.png';

const EchartIframe = ({
    name,
    id,
    renderImg
}) => {
    return <div className={cls.echartWrapper}>
        {name && <div className={cls.name}>{name}</div>}
        {renderImg && <img className={cls.renderImg} src={echartsImg} alt='img'/>}
        {id && id !== 'none' ? <iframe className={cls.iframe} src={`${window.location.port === '3000' ? `${window.location.protocol}//${window.location.hostname}:8082` : ''}/echarts/index.html?preset=${id}&noBG=true&compact=true`} />:
        !renderImg && <div>{I18n.t('select id in settings')}</div>}
    </div>;
}

EchartIframe.defaultProps = {
};

EchartIframe.propTypes = {
    name: PropTypes.string,
    id: PropTypes.string,
};

export default EchartIframe;