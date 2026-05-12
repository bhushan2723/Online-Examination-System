const SidebarLink = ({ icon, label, active = false, onClick, testId }) => {
  return (
    <a
      href="#"
      className={`sidebar-link d-flex align-items-center gap-3 text-decoration-none ${active ? 'text-primary' : 'text-dark'}`}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      style={{ padding: '0.5rem', borderRadius: '0.25rem' }}
      data-cy = {testId}
    >
      <i className={`fas ${icon} fa-fw`} />
      <span>{label}</span>
    </a>
  );
};

export default SidebarLink;