const DeleteModal = ({
  customer, onConfirm, onClose,
}: {
  customer: Customer | null;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  if (!customer) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <HiOutlineExclamationCircle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold">Delete Customer</h3>
        </div>
        <p className="text-muted mb-2">
          Are you sure you want to delete <span className="font-medium text-text">{customer.name}</span>?
        </p>
        <p className="text-sm text-muted mb-6">This action cannot be undone. All order history will be affected.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={onConfirm} className="btn btn-danger">Delete</button>
        </div>
      </motion.div>
    </div>
  );
};
