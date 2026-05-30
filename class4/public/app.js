document.addEventListener('DOMContentLoaded', () => {
    // DOM Element Selections
    const form = document.getElementById('registration-form');
    const fileInput = document.getElementById('image');
    const uploadZone = document.getElementById('upload-zone');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removePreviewBtn = document.getElementById('remove-preview-btn');
    const submitBtn = document.getElementById('submit-btn');

    const showDataBtn = document.getElementById('show-data-btn');
    const displayBody = document.getElementById('display-body');
    const emptyStateContent = document.getElementById('empty-state-content');
    const usersGrid = document.getElementById('users-grid');
    const notificationContainer = document.getElementById('notification-container');

    // Edit Modal Elements
    const editModalOverlay = document.getElementById('edit-modal-overlay');
    const editForm = document.getElementById('edit-form');
    const editId = document.getElementById('edit-id');
    const editUsername = document.getElementById('edit-username');
    const editUserId = document.getElementById('edit-userId');
    const editMobileNumber = document.getElementById('edit-mobileNumber');
    const editMailId = document.getElementById('edit-mailId');
    const editImage = document.getElementById('edit-image');
    const editCurrentAvatar = document.getElementById('edit-current-avatar');
    const editFileName = document.getElementById('edit-file-name');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalSaveBtn = document.getElementById('modal-save-btn');

    // Delete Modal Elements
    const deleteModalOverlay = document.getElementById('delete-modal-overlay');
    const deleteId = document.getElementById('delete-id');
    const deleteUserName = document.getElementById('delete-user-name');
    const deleteCancelBtn = document.getElementById('delete-cancel-btn');
    const deleteConfirmBtn = document.getElementById('delete-confirm-btn');

    // App state
    let isShowingData = false;

    // ==========================================
    // NOTIFICATION TOAST SYSTEM
    // ==========================================
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = 'fa-circle-info';
        if (type === 'success') icon = 'fa-circle-check';
        if (type === 'error') icon = 'fa-triangle-exclamation';

        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span class="toast-message">${message}</span>
        `;

        notificationContainer.appendChild(toast);

        // Slide out and remove toast after 4 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px) scale(0.95)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    }

    // ==========================================
    // IMAGE PREVIEW & UPLOAD HANDLERS
    // ==========================================

    // Process and show image preview
    function handleFile(file) {
        if (!file) return;

        // Verify it is indeed an image file
        if (!file.type.startsWith('image/')) {
            showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
            return;
        }

        // Limit size to 5MB
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size exceeds 5MB limit.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            uploadPlaceholder.classList.add('hidden');
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    // Input file selection change
    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    // Remove selected image preview
    removePreviewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        imagePreview.src = '';
        previewContainer.classList.add('hidden');
        uploadPlaceholder.classList.remove('hidden');
    });

    // DRAG AND DROP FUNCTIONALITY
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadZone.style.borderColor = 'var(--primary)';
            uploadZone.style.background = 'rgba(99, 102, 241, 0.05)';
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadZone.style.borderColor = 'var(--border-glass)';
            uploadZone.style.background = 'rgba(255, 255, 255, 0.01)';
        }, false);
    });

    uploadZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFile(files[0]);
        }
    });

    // ==========================================
    // BACKEND INTEGRATION: CREATE USER
    // ==========================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const userId = document.getElementById('userId').value.trim();
        const mobileNumber = document.getElementById('mobileNumber').value.trim();
        const mailId = document.getElementById('mailId').value.trim();
        const file = fileInput.files[0];

        if (!username || !userId || !mobileNumber || !mailId) {
            showToast('Please fill out all the input fields.', 'error');
            return;
        }

        if (!file) {
            showToast('Please select or upload a profile image.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(mailId)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }

        submitBtn.disabled = true;
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <span>Storing Data...</span>
            <i class="fa-solid fa-spinner fa-spin"></i>
        `;

        const formData = new FormData();
        formData.append('username', username);
        formData.append('userId', userId);
        formData.append('mobileNumber', mobileNumber);
        formData.append('mailId', mailId);
        formData.append('image', file);

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.message || 'User stored successfully!', 'success');
                form.reset();
                removePreviewBtn.click();

                if (isShowingData) {
                    fetchAndRenderUsers(false);
                }
            } else {
                showToast(data.error || 'Registration failed.', 'error');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showToast('Could not connect to Node server. Make sure it is running.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
        }
    });

    // ==========================================
    // BACKEND INTEGRATION: READ USERS
    // ==========================================

    async function fetchAndRenderUsers(showSkeleton = true) {
        if (showSkeleton) {
            renderSkeletons();
        }

        try {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Failed to retrieve records');

            const users = await response.json();

            if (users.length === 0) {
                usersGrid.innerHTML = '';
                usersGrid.classList.add('hidden');
                emptyStateContent.innerHTML = `
                    <div class="pulse-circle">
                        <i class="fa-solid fa-folder-open server-pulse"></i>
                    </div>
                    <h3>No Records Found</h3>
                    <p>Connection successful, but the database collection is currently empty. Register your first user on the left!</p>
                `;
                emptyStateContent.classList.remove('hidden');
                displayBody.classList.add('empty-state');
                return;
            }

            renderUserCards(users);
        } catch (error) {
            console.error('Fetch records error:', error);
            showToast('Error fetching database records.', 'error');

            usersGrid.classList.add('hidden');
            emptyStateContent.innerHTML = `
                <div class="pulse-circle" style="border-color: rgba(239,68,68,0.2);">
                    <i class="fa-solid fa-triangle-exclamation server-pulse" style="color: var(--danger);"></i>
                </div>
                <h3 style="color: var(--danger);">Connection Interrupted</h3>
                <p>Failed to query MongoDB. Please verify server connection and database availability.</p>
            `;
            emptyStateContent.classList.remove('hidden');
            displayBody.classList.add('empty-state');
        }
    }

    function renderSkeletons() {
        emptyStateContent.classList.add('hidden');
        displayBody.classList.remove('empty-state');
        usersGrid.innerHTML = '';
        usersGrid.classList.remove('hidden');
        usersGrid.classList.add('active');

        for (let i = 0; i < 6; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-card';
            skeleton.innerHTML = `
                <div class="skeleton circle"></div>
                <div class="skeleton title"></div>
                <div class="skeleton tag"></div>
                <div class="skeleton line"></div>
                <div class="skeleton line" style="width: 85%"></div>
            `;
            usersGrid.appendChild(skeleton);
        }
    }

    // Render user cards with EDIT and DELETE action buttons
    function renderUserCards(users) {
        usersGrid.innerHTML = '';
        usersGrid.classList.remove('hidden');
        usersGrid.classList.add('active');
        emptyStateContent.classList.add('hidden');
        displayBody.classList.remove('empty-state');

        users.forEach((user, index) => {
            const card = document.createElement('div');
            card.className = 'user-card';
            card.style.animationDelay = `${index * 0.06}s`;

            card.innerHTML = `
                <div class="avatar-wrapper">
                    <img src="${user.imagePath}" alt="${escapeHTML(user.username)}" onerror="this.src='https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'">
                </div>
                <h3 class="user-name">${escapeHTML(user.username)}</h3>
                <span class="user-id-tag">@${escapeHTML(user.userId)}</span>
                
                <div class="user-details">
                    <div class="detail-row" title="${escapeHTML(user.mobileNumber)}">
                        <i class="fa-solid fa-phone"></i>
                        <span>${escapeHTML(user.mobileNumber)}</span>
                    </div>
                    <div class="detail-row" title="${escapeHTML(user.mailId)}">
                        <i class="fa-regular fa-envelope"></i>
                        <span>${escapeHTML(user.mailId)}</span>
                    </div>
                </div>

                <div class="card-actions">
                    <button type="button" class="card-action-btn edit-btn" data-id="${user._id}" data-username="${escapeHTML(user.username)}" data-userid="${escapeHTML(user.userId)}" data-mobile="${escapeHTML(user.mobileNumber)}" data-mail="${escapeHTML(user.mailId)}" data-image="${user.imagePath}">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button type="button" class="card-action-btn delete-btn" data-id="${user._id}" data-username="${escapeHTML(user.username)}">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            `;
            usersGrid.appendChild(card);
        });

        // Attach event listeners to the newly created action buttons
        attachCardActionListeners();
    }

    // ==========================================
    // CARD ACTION BUTTON LISTENERS
    // ==========================================
    function attachCardActionListeners() {
        // Edit buttons
        document.querySelectorAll('.card-action-btn.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                openEditModal(btn.dataset);
            });
        });

        // Delete buttons
        document.querySelectorAll('.card-action-btn.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                openDeleteModal(btn.dataset.id, btn.dataset.username);
            });
        });
    }

    // ==========================================
    // EDIT MODAL LOGIC
    // ==========================================
    function openEditModal(data) {
        editId.value = data.id;
        editUsername.value = data.username;
        editUserId.value = data.userid;
        editMobileNumber.value = data.mobile;
        editMailId.value = data.mail;
        editCurrentAvatar.src = data.image;
        editImage.value = '';
        editFileName.textContent = 'No file selected';
        editModalOverlay.classList.remove('hidden');
    }

    function closeEditModal() {
        editModalOverlay.classList.add('hidden');
        editForm.reset();
        editFileName.textContent = 'No file selected';
    }

    modalCloseBtn.addEventListener('click', closeEditModal);
    modalCancelBtn.addEventListener('click', closeEditModal);
    editModalOverlay.addEventListener('click', (e) => {
        if (e.target === editModalOverlay) closeEditModal();
    });

    // Show selected file name in edit modal
    editImage.addEventListener('change', () => {
        if (editImage.files[0]) {
            editFileName.textContent = editImage.files[0].name;
        } else {
            editFileName.textContent = 'No file selected';
        }
    });

    // Submit edit form (PUT request)
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = editId.value;
        const username = editUsername.value.trim();
        const userId = editUserId.value.trim();
        const mobileNumber = editMobileNumber.value.trim();
        const mailId = editMailId.value.trim();

        if (!username || !userId || !mobileNumber || !mailId) {
            showToast('Please fill out all fields.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(mailId)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }

        modalSaveBtn.disabled = true;
        const originalHTML = modalSaveBtn.innerHTML;
        modalSaveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        const formData = new FormData();
        formData.append('username', username);
        formData.append('userId', userId);
        formData.append('mobileNumber', mobileNumber);
        formData.append('mailId', mailId);
        if (editImage.files[0]) {
            formData.append('image', editImage.files[0]);
        }

        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.message || 'User updated successfully!', 'success');
                closeEditModal();
                fetchAndRenderUsers(false);
            } else {
                showToast(data.error || 'Update failed.', 'error');
            }
        } catch (error) {
            console.error('Update error:', error);
            showToast('Could not connect to server.', 'error');
        } finally {
            modalSaveBtn.disabled = false;
            modalSaveBtn.innerHTML = originalHTML;
        }
    });

    // ==========================================
    // DELETE MODAL LOGIC
    // ==========================================
    function openDeleteModal(id, username) {
        deleteId.value = id;
        deleteUserName.textContent = `"${username}"`;
        deleteModalOverlay.classList.remove('hidden');
    }

    function closeDeleteModal() {
        deleteModalOverlay.classList.add('hidden');
    }

    deleteCancelBtn.addEventListener('click', closeDeleteModal);
    deleteModalOverlay.addEventListener('click', (e) => {
        if (e.target === deleteModalOverlay) closeDeleteModal();
    });

    // Confirm delete (DELETE request)
    deleteConfirmBtn.addEventListener('click', async () => {
        const id = deleteId.value;

        deleteConfirmBtn.disabled = true;
        const originalHTML = deleteConfirmBtn.innerHTML;
        deleteConfirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';

        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.message || 'User deleted successfully!', 'success');
                closeDeleteModal();
                fetchAndRenderUsers(false);
            } else {
                showToast(data.error || 'Delete failed.', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Could not connect to server.', 'error');
        } finally {
            deleteConfirmBtn.disabled = false;
            deleteConfirmBtn.innerHTML = originalHTML;
        }
    });

    // ==========================================
    // SHOW DATA BUTTON TOGGLE
    // ==========================================
    showDataBtn.addEventListener('click', () => {
        isShowingData = !isShowingData;

        if (isShowingData) {
            showDataBtn.classList.add('active');
            showDataBtn.innerHTML = `
                <i class="fa-solid fa-eye-slash eye-icon"></i>
                <span>Hide Data</span>
            `;
            fetchAndRenderUsers();
        } else {
            showDataBtn.classList.remove('active');
            showDataBtn.innerHTML = `
                <i class="fa-solid fa-eye eye-icon"></i>
                <span>Show Data</span>
            `;
            usersGrid.classList.add('hidden');
            emptyStateContent.innerHTML = `
                <div class="pulse-circle">
                    <i class="fa-solid fa-server server-pulse"></i>
                </div>
                <h3>Ready to Retrieve Records</h3>
                <p>Click "Show Data" to pull live user registrations directly from MongoDB Atlas cluster in real-time.</p>
            `;
            emptyStateContent.classList.remove('hidden');
            displayBody.classList.add('empty-state');
        }
    });

    // ==========================================
    // UTILITY
    // ==========================================
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
