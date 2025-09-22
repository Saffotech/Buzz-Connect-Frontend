{/* Updated Delete Confirmation Modal */}
<DeleteConfirmationModal
  deleteFromInsta={deleteFromInsta}
  setDeleteFromInsta={setDeleteFromInsta}
  deleteFromYouTube={deleteFromYouTube}
  setDeleteFromYouTube={setDeleteFromYouTube}
  isOpen={showDeleteConfirm}
  post={postToDelete}
  onClose={() => {
    setShowDeleteConfirm(false);
    setPostToDelete(null);
    setDeleteFromInsta(false);
    setDeleteFromYouTube(false);
  }}
  onConfirm={() => handleDeletePost(postToDelete?._id || postToDelete?.id)}
  postTitle={postToDelete?.content?.substring(0, 50) || 'this post'}
/>
