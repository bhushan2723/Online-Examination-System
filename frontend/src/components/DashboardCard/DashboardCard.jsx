import './DashboardCard.css';
import {useRef, useState, useEffect} from "react";
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const DashboardCard = ({
  title = 'Average Scores',
  value = '64.3 %',
  subtitle = '20% of total',
  icon = 'fa-users',
  tooltip = 'Tooltip test', // 👈 new prop for tooltip text
  titleClassName = 'text-secondary fw-semibold text-xs',
  valueClassName = 'fw-bold fs-2 mb-1 text-dark float-start',
  subtitleClassName = 'text-secondary text-xs float-start',
  containerClassName = 'container-center',
  cardClassName = 'card-custom',
}) => {

  const ref = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (ref.current) {
      setIsOverflowing(ref.current.scrollWidth > ref.current.clientWidth);
    }
  }, [value]);


  const cardContent = (
    <div className={cardClassName}>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className={titleClassName}>{title}</span>
        {icon && <i className={`fas ${icon} fa-lg`}></i>}
      </div>
      <div className={`${valueClassName} marquee-container`} ref={ref}>
        <span className={isOverflowing ? "marquee-text" : ""}>{value}</span>
      </div>
      <div className={subtitleClassName}>{subtitle}</div>
    </div>
  );

  return (
    <div className={containerClassName}>
      {tooltip ? (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-${title}`}>{tooltip}</Tooltip>}
        >
          <div>{cardContent}</div>
        </OverlayTrigger>
      ) : (
        cardContent
      )}
    </div>
  );
};

export default DashboardCard;
