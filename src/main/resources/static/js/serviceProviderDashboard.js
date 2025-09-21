document.addEventListener("DOMContentLoaded", function () {
    // Display username & role in header
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("jwtToken");

    if (!token || !userId || role !== 'PROVIDER') {
        Swal.fire({
            icon: 'warning',
            title: 'Access Denied',
            text: 'Please log in as a provider.'
        }).then(() => {
            window.location.href = '/login.html';
        });
        return;
    }

    // Capitalize first letter
    function capitalizeFirstLetter(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Display username & role
    if (username) {
        const capitalizedUsername = capitalizeFirstLetter(username);
        document.querySelectorAll('.welcome-user').forEach(el => el.textContent = capitalizedUsername);
        document.querySelectorAll('.user-name').forEach(el => el.textContent = capitalizedUsername);
    }

    const headerRole = document.getElementById('header-role');
    if (headerRole) {
        headerRole.textContent = role;
    }

    // Page switching for sidebar links
    const providerLinks = document.querySelectorAll(".provider-links a");
    const pages = document.querySelectorAll(".page-content");

    providerLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const pageId = this.dataset.page;

            pages.forEach(p => p.classList.remove("active")); // hide all pages
            const activePage = document.getElementById(pageId);
            if (activePage) activePage.classList.add("active");

            providerLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");

            // Load data based on page
            if (pageId === 'provider-available-jobs') loadAvailableJobs(0, 10);
            else if (pageId === 'provider-my-work') loadMyWork(0, 10);
            else if (pageId === 'provider-notifications') loadNotifications();
            else if (pageId === 'provider-profile') loadProviderProfile();
        });
    });


    // ------------- Pagination --------------
    function updatePagination(page, totalPages, size, totalItems, loadFunction, containerId, paginationId, pageInfoId) {
        const pagination = document.querySelector(`#${containerId} #${paginationId}`);
        if (!pagination) return;
        pagination.innerHTML = '';

        const ul = document.createElement('ul');
        ul.className = 'pagination';

        const maxPagesToShow = 5; // Show up to 5 pages around current
        let startPage = Math.max(0, page - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

        // Adjust startPage if we are near the end
        startPage = Math.max(0, endPage - maxPagesToShow + 1);

        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${page === 0 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#">Prev</a>`;
        if (page > 0) {
            prevLi.addEventListener('click', (e) => {
                e.preventDefault();
                loadFunction(page - 1, size);
            });
        }
        ul.appendChild(prevLi);

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === page ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
            if (i !== page) {
                pageLi.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadFunction(i, size);
                });
            }
            ul.appendChild(pageLi);
        }

        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${page >= totalPages - 1 ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#">Next</a>`;
        if (page < totalPages - 1) {
            nextLi.addEventListener('click', (e) => {
                e.preventDefault();
                loadFunction(page + 1, size);
            });
        }
        ul.appendChild(nextLi);

        pagination.appendChild(ul);

        // Update page info
        const pageInfo = document.querySelector(pageInfoId);
        if (pageInfo) {
            const start = totalItems === 0 ? 0 : page * size + 1;
            const end = Math.min((page + 1) * size, totalItems);
            pageInfo.textContent = `Showing ${start} to ${end} of ${totalItems} entries`;
        }
    }


    // ---------------- Load Available Jobs ----------------
    async function loadAvailableJobs(page = 0, size = 10, currentUserFilter = '', currentUserSearch = '') {
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Not Logged In',
                text: 'Please log in to view available jobs.',
                confirmButtonText: 'Go to Login'
            }).then(() => {
                window.location.href = '/login.html';
            });
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/api/jobs/available-jobs?page=${page}&size=${size}&sort=created_at,desc`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) {
                if (res.status === 401) throw new Error('Unauthorized: Invalid or expired token.');
                if (res.status === 403) throw new Error('Forbidden: Only providers can view available jobs.');
                throw new Error(`Failed to fetch jobs: Server returned ${res.status}`);
            }

            const data = await res.json();
            console.log('API Response:', data); // Debug response
            const jobs = Array.isArray(data) ? data : (data.content || []);
            const totalItems = (data && data.totalElements !== undefined)
                ? data.totalElements
                : (Array.isArray(data) ? data.length : (jobs.length || 0));
            const totalPages = (data && data.totalPages !== undefined)
                ? data.totalPages
                : Math.max(1, Math.ceil(totalItems / size));


            // Update Available Jobs stat card
            const statAvailableJobs = document.getElementById('stat-available-jobs');
            if (statAvailableJobs) statAvailableJobs.textContent = totalItems;


            const tbody = document.querySelector('#provider-available-jobs .available-job-table tbody');
            if (!tbody) return;
            tbody.innerHTML = '';

            if (!jobs || jobs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No available jobs found.</td></tr>';
            } else {
                jobs.forEach(job => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-category', job.category.charAt(0).toUpperCase() + job.category.slice(1));

                    row.innerHTML = `
                        <td>${job.title}</td>
                        <td>${job.customerEmail}</td>
                        <td>${job.category.charAt(0).toUpperCase() + job.category.slice(1)}</td>
                        <td>${job.location}</td>
                        <td>$${job.budget || 'N/A'}</td>
                        <td>${job.datePosted}</td>
                        <td>
                            <a href="#" class="btn btn-sm btn-success action-btn accept-btn" data-job-id="${job.id}"><i class="fas fa-check"></i> Accept</a>
                            <a href="#" class="btn btn-sm btn-danger action-btn reject-btn" data-job-id="${job.id}"><i class="fas fa-times"></i> Reject</a>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }

            attachJobActionEvents();
            attachJobFilters();

            // Update pagination info
            updatePagination(page, totalPages, size, totalItems, loadAvailableJobs, 'provider-available-jobs', 'available-job-pagination', '#available-job-page-info', [currentUserFilter, currentUserSearch]);


        } catch (error) {
            console.error('Error fetching available jobs:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
                confirmButtonText: 'OK'
            }).then(() => {
                if (error.message.includes('Unauthorized')) {
                    localStorage.clear();
                    window.location.href = '/login.html';
                }
            });
        }
    }

    // Toggle filter buttons visibility
    const filterToggle = document.getElementById('filter-toggle');
    if (filterToggle) {
        filterToggle.addEventListener('click', function (e) {
            e.preventDefault();
            const filterContainer = document.getElementById('job-filters');
            if (filterContainer) {
                filterContainer.classList.toggle('show');
            }
        });
    }

    // Filter table rows based on category
    function attachJobFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const tbody = document.querySelector('#provider-available-jobs .available-job-table tbody');
        const pageInfo = document.getElementById('available-job-page-info');

        filterButtons.forEach(button => {
            button.addEventListener('click', function () {
                // Active button highlight
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                const filter = this.getAttribute('data-filter').toLowerCase();
                const rows = tbody.querySelectorAll('tr');
                let visibleRows = 0;

                rows.forEach(row => {
                    const category = row.getAttribute('data-category')?.toLowerCase();
                    if (filter === 'all' || category === filter) {
                        row.style.display = '';
                        visibleRows++;
                    } else {
                        row.style.display = 'none';
                    }
                });

                // Update page info
                if (pageInfo) {
                    const totalRows = rows.length;
                    pageInfo.textContent = `Showing ${visibleRows} of ${totalRows} entries`;
                }
            });
        });
    }



    // ---------------- Load My Work ----------------
    async function loadMyWork(page = 0, size = 10) {
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:8080/api/jobs/my-work?page=${page}&size=${size}&sort=created_at,desc`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to fetch my work");

            const data = await res.json();
            const jobs = data.content || [];
            const totalPages = data.totalPages || 1;
            const totalItems = data.totalElements || 0;

            const tbody = document.querySelector('#provider-my-work .my-work-table tbody');
            if (!tbody) return;
            tbody.innerHTML = '';

            if (!jobs || jobs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No current jobs found.</td></tr>';
            } else {
                jobs.forEach(job => {

                    let actionButtons = `
                    <button class="btn btn-sm btn-info view-btn action-btn" data-job-id="${job.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                `;

                    if (job.status === 'ACCEPTED') {
                        actionButtons += `
                        <button class="btn btn-sm btn-success start-btn action-btn" data-job-id="${job.id}">
                            <i class="fas fa-play"></i>
                        </button>
                    `;
                    } else if (job.status === 'IN_PROGRESS') {
                        actionButtons += `
                        <button class="btn btn-sm btn-primary complete-btn action-btn" data-job-id="${job.id}">
                            <i class="fas fa-check"></i>
                        </button>
                    `;
                    }

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${job.title}</td>
                        <td>${job.customerEmail}</td>
                        <td>${job.datePosted || 'N/A'}</td>
                        <td>${job.preferredDate || 'N/A'}</td>
                        <td><span class="badge-${job.status.toLowerCase()}">${job.status}</span></td>
                        <td>${actionButtons}</td>
                    `;
                    tbody.appendChild(row);
                });
            }

            updateStatusCounts(jobs);

            // update pagination info
            updatePagination(page, totalPages, size, totalItems, loadMyWork, 'provider-my-work', 'my-work-pagination', '#my-work-page-info');
            attachJobActionEvents();

        } catch (err) {
            console.error("Error loading my work:", err);
            Swal.fire("Error", "Failed to load my work", "error");
        }
    }


    // ---------------- Update Status Counts ----------------
    function updateStatusCounts(jobs) {
        let accepted = 0, inProgress = 0, completed = 0;

        jobs.forEach(job => {
            if (job.status === "ACCEPTED") accepted++;
            else if (job.status === "IN_PROGRESS") inProgress++;
            else if (job.status === "COMPLETED") completed++;
        });

        const pendingEl   = document.querySelector('#provider-my-work .status-card:nth-child(1) .status-value');
        const activeEl    = document.querySelector('#provider-my-work .status-card:nth-child(2) .status-value');
        const completedEl = document.querySelector('#provider-my-work .status-card:nth-child(3) .status-value');

        if (pendingEl)   pendingEl.textContent   = inProgress; // "Pending Jobs" showing In Progress count
        if (activeEl)    activeEl.textContent    = accepted;   // "Active Jobs" showing Accepted count
        if (completedEl) completedEl.textContent = completed;  // "Completed Jobs" showing Completed count


        // Update Stat Cards
        const statActiveTime = document.getElementById('stat-active-time');
        const statCompletedJobs = document.getElementById('stat-completed-jobs');
        if (statActiveTime) statActiveTime.textContent = inProgress;
        if (statCompletedJobs) statCompletedJobs.textContent = completed;
    }


    // ---------------- Handle Actions ----------------
    function attachJobActionEvents() {
        const userRole = localStorage.getItem('role');
        const token = localStorage.getItem("jwtToken");

        document.querySelectorAll('.action-btn').forEach(btn => {
            if (btn.classList.contains('reject-btn') && userRole !== 'SUPER_ADMIN') {
                btn.style.display = 'none';
                return; // skip attaching event
            }

            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const jobId = btn.dataset.jobId;

                // ---------------- ACCEPT JOB ----------------
                if (btn.classList.contains('accept-btn')) {
                    if (userRole !== 'PROVIDER') {
                        Swal.fire('Error', 'Only providers can accept jobs', 'error');
                        return;
                    }
                    Swal.fire({
                        title: 'Accept Job?',
                        text: 'Are you sure you want to accept this job?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, accept it!',
                        cancelButtonText: 'Cancel'
                    }).then(async (result) => {
                        if (result.isConfirmed) {

                            Swal.fire({
                                title: 'Processing...',
                                text: 'Please wait while we accept the job',
                                allowOutsideClick: false,
                                didOpen: () => {
                                    Swal.showLoading(); // Shows spinner
                                }
                            });

                            try {
                                const res = await fetch(`http://localhost:8080/api/jobs/accept/${jobId}`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    }
                                });
                                if (!res.ok) throw new Error("Failed to accept job");
                                const data = await res.json();
                                Swal.fire('Success', `You accepted job: ${data.title}`, 'success');
                            } catch (err) {
                                Swal.fire('Error', err.message, 'error');
                            }
                        }
                    });
                }

                // ---------------- REJECT JOB ----------------
                else if (btn.classList.contains('reject-btn')) {
                    Swal.fire({
                        title: 'Reject Job?',
                        text: 'Only Super Admins can reject jobs. Proceed?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, reject it!',
                        cancelButtonText: 'Cancel'
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            try {
                                const res = await fetch(`http://localhost:8080/api/jobs/reject/${jobId}`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    }
                                });
                                if (!res.ok) throw new Error("Failed to reject job (maybe not Super Admin)");
                                Swal.fire('Success', 'Job rejected successfully', 'success');
                            } catch (err) {
                                Swal.fire('Error', err.message, 'error');
                            }
                        }
                    });
                } else if (btn.classList.contains('start-btn')) {
                    try {
                        const res = await fetch(`http://localhost:8080/api/jobs/start/${jobId}`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (!res.ok) throw new Error("Failed to start job");
                        Swal.fire('Success', 'Job started successfully', 'success');
                        loadMyWork(0, 10);
                        loadNotifications();

                    } catch (err) {
                        Swal.fire('Error', err.message, 'error');
                    }
                } else if (btn.classList.contains('complete-btn')) {
                    try {
                        const res = await fetch(`http://localhost:8080/api/jobs/complete/${jobId}`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (!res.ok) throw new Error("Failed to complete job");
                        Swal.fire('Success', 'Job completed successfully', 'success');
                        loadMyWork(0, 10);
                        loadNotifications();

                    } catch (err) {
                        Swal.fire('Error', err.message, 'error');
                    }
                } else if (btn.classList.contains('view-btn')) {
                    try {
                        const res = await fetch(`http://localhost:8080/api/jobs/view/${jobId}`, {
                            headers: { Authorization: "Bearer " + token }
                        });
                        if (!res.ok) throw new Error("Failed to fetch job");
                        const job = await res.json();
                        Swal.fire({
                            title: "Job Details",
                            html: `
                                <strong>Title:</strong> ${job.title}<br>
                                <strong>Category:</strong> ${job.category}<br>
                                <strong>Description:</strong> ${job.description}<br>
                                <strong>Budget:</strong> $${job.budget || 'N/A'}<br>
                                <strong>Location:</strong> ${job.location}<br>
                                <strong>Preferred Date:</strong> ${job.preferredDate || 'N/A'}<br>
                                <strong>Preferred Time:</strong> ${job.preferredTime || 'N/A'}<br>
                                <strong>Status:</strong> ${job.status}<br>
                                <strong>Customer Email:</strong> ${job.customerEmail}<br>
                                <strong>Posted:</strong> ${new Date(job.createdAt).toLocaleDateString()}
                            `,
                            icon: "info"
                        });
                    } catch (err) {
                        Swal.fire("Error", "Failed to view job", "error");
                    }
                }
            });
        });
    }


    // ---------------- Opportunities table ----------------
    async function loadOpportunities() {
        if (!token) return;
        try {
            const res = await fetch(`http://localhost:8080/api/jobs/available-jobs?page=0&size=5&sort=created_at,desc`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (!res.ok) throw new Error("Failed to fetch opportunities");
            const jobs = await res.json();
            const opportunityTable = document.querySelector(".opportunity-table tbody");
            if (!opportunityTable) return;

            opportunityTable.innerHTML = "";

            if (!jobs || jobs.length === 0) {
                opportunityTable.innerHTML = '<tr><td colspan="5" class="text-center">No opportunities available.</td></tr>';
                return;
            }

            jobs.slice(0, 5).forEach(job => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${job.title}</td>
                    <td>${job.customerEmail}</td>
                    <td>${job.category}</td>
                    <td>$${job.budget || "-"}</td>
                    <td>
                        <a href="#" class="btn btn-sm btn-success action-btn accept-btn" data-job-id="${job.id}">
                            <i class="fas fa-check"></i> Accept
                        </a>
                        <a href="#" class="btn btn-sm btn-danger action-btn reject-btn" data-job-id="${job.id}">
                            <i class="fas fa-times"></i> Reject
                        </a>
                    </td>
                `;
                opportunityTable.appendChild(tr);
            });
            attachJobActionEvents();
        } catch (err) {
            console.error("Error loading opportunities:", err);
            Swal.fire("Error", "Failed to load opportunities", "error");
        }
    }


    // -------------------- Load Provider Profile --------------------
    async function loadProviderProfile() {
        const profileImageEl = document.getElementById("provider-profileImage");
        const headerImageEl = document.getElementById("header-profile-image");
        const firstNameEl = document.getElementById("firstName");
        const contactEmailEl = document.getElementById("contactEmail");
        const contactPhoneEl = document.getElementById("contactPhone");
        const contactAddressEl = document.getElementById("contactAddress");

        const headerName = document.getElementById("header-name");

        const inputFirstName = document.getElementById("provider-first-name");
        const inputLastName = document.getElementById("provider-last-name");
        const inputEmail = document.getElementById("provider-email");
        const inputPhone = document.getElementById("provider-phone");
        const inputAddress = document.getElementById("provider-address");
        const inputExperience = document.getElementById("provider-experience");
        const inputHourlyRate = document.getElementById("provider-hourly-rate");
        const inputBio = document.getElementById("provider-bio");

        const servicesListEl = document.getElementById("servicesList");

        try {
            const res = await fetch(`http://localhost:8080/api/profile/provider/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to fetch profile");
            }

            const data = await res.json();
            const profile = data.data;

            const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`;

            // Display profile info
            const profileImageUrl = profile.profileImage
                ? `/api/profile/image/${profile.profileImage}?t=${new Date().getTime()}`
                : "https://placehold.co/128x128/6366f1/ffffff?text=User";

            profileImageEl.src = profileImageUrl;
            headerImageEl.src = profileImageUrl;
            firstNameEl.textContent = `${profile.firstName || ""} ${profile.lastName || ""}`;
            headerName.textContent = fullName;
            contactEmailEl.textContent = profile.email || '';
            contactPhoneEl.textContent = profile.phoneNo || '';
            contactAddressEl.textContent = profile.address || '';

            // Fill edit form
            inputFirstName.value = profile.firstName || '';
            inputLastName.value = profile.lastName || '';
            inputEmail.value = profile.email || '';
            inputPhone.value = profile.phoneNo || '';
            inputAddress.value = profile.address || '';
            inputExperience.value = profile.experienceYears ? profile.experienceYears.toString() : "3-5 years";
            inputHourlyRate.value = profile.hourlyRate || '';
            inputBio.value = profile.bio || '';

            // Fill services offered
            servicesListEl.innerHTML = '';
            if (profile.serviceOffered && profile.serviceOffered.length > 0) {
                profile.serviceOffered.forEach(service => {
                    const span = document.createElement('span');
                    span.classList.add('service-badge');
                    span.textContent = service;
                    servicesListEl.appendChild(span);

                    const checkbox = document.getElementById(service.toLowerCase());
                    if (checkbox) checkbox.checked = true;
                });
            }

        } catch (err) {
            console.error("Error loading profile:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to load profile: ${err.message}`
            });
        }
    }

    // -------------------- Image Preview on File Select --------------------
    document.getElementById("imageFile").addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById("provider-profileImage").src = e.target.result;
                document.getElementById("header-profile-image").src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // -------------------- Handle Profile Update --------------------
    document.getElementById("provider-profile-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();

        const profileData = {
            firstName: document.getElementById("provider-first-name").value,
            lastName: document.getElementById("provider-last-name").value,
            email: document.getElementById("provider-email").value,
            phoneNo: document.getElementById("provider-phone").value,
            address: document.getElementById("provider-address").value,
            experienceYears: parseInt(document.getElementById("provider-experience").value),
            hourlyRate: parseFloat(document.getElementById("provider-hourly-rate").value),
            serviceOffered: Array.from(document.querySelectorAll(".services-container input[type='checkbox']:checked"))
                .map(cb => cb.id),
            bio: document.getElementById("provider-bio").value
        };

        formData.append("providerProfile", new Blob([JSON.stringify(profileData)], { type: "application/json" }));

        const fileInput = document.getElementById("imageFile");
        const file = fileInput.files[0];
        if (file) formData.append("image", file);

        try {
            const res = await fetch(`/api/profile/provider/${userId}`, {
                method: "PUT",
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Success', text: 'Profile updated successfully!' });
                // Reload profile to update image and info
                loadProviderProfile();
            } else {
                throw new Error(data.message || 'Failed to update profile');
            }

        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        }
    });


    // ---------------- Notifications ----------------
    async function loadNotifications(filter = "all") {
        if (!token || !userId) return;
        try {
            const countRes = await fetch(`http://localhost:8080/api/notifications/user/${userId}/count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!countRes.ok) throw new Error("Failed to fetch notification count");
            const { count } = await countRes.json();

            const headerBadge = document.getElementById('header-notification-badge');
            const sidebarBadge = document.querySelector('.provider-links a[data-page="provider-notifications"] .badge');
            if (headerBadge) {
                headerBadge.textContent = count;
                headerBadge.style.display = count > 0 ? 'flex' : 'none';
            }
            if (sidebarBadge) {
                sidebarBadge.textContent = count;
                sidebarBadge.style.display = count > 0 ? 'inline-block' : 'none';
            }

            const allRes = await fetch(`http://localhost:8080/api/notifications/user/${userId}/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!allRes.ok) throw new Error("Failed to fetch notifications");
            const allNotifications = await allRes.json();

            let filteredNotifications = allNotifications;
            if (filter === "unread") {
                filteredNotifications = allNotifications.filter(n => !n.isRead);
            }

            const allCount = allNotifications.length;
            const unreadCount = allNotifications.filter(n => !n.isRead).length;
            const tabs = document.querySelectorAll('.job-filters .filter-tab');
            if (tabs[0]) tabs[0].querySelector('.badge').textContent = allCount;
            if (tabs[1]) tabs[1].querySelector('.badge').textContent = unreadCount;

            tabs.forEach(tab => {
                tab.classList.remove('active');
                if ((filter === "all" && tab.textContent.includes("All Notifications")) || (filter === "unread" && tab.textContent.includes("Unread"))) {
                    tab.classList.add('active');
                }
            });

            const notificationContainer = document.querySelector("#provider-notifications .notifications");
            if (!notificationContainer) return;
            notificationContainer.innerHTML = "";

            if (!filteredNotifications || filteredNotifications.length === 0) {
                notificationContainer.innerHTML = '<div class="text-center p-4">No notifications</div>';
                return;
            }

            filteredNotifications.forEach(n => {
                const card = document.createElement("div");
                card.className = `notification-card ${n.isRead ? '' : 'unread'}`;
                card.dataset.id = n.id;

                let iconClass = "info", icon = "fas fa-info-circle";
                switch (n.type) {
                    case "JOB_ACCEPTED":
                        iconClass = "success";
                        icon = "fas fa-check-circle";
                        break;
                    case "JOB_COMPLETED":
                        iconClass = "info";
                        icon = "fas fa-check-double";
                        break;
                    case "SYSTEM":
                        iconClass = "info";
                        icon = "fas fa-server";
                        break;
                    default:
                        iconClass = "warning";
                        icon = "fas fa-bell";
                }

                card.innerHTML = `
                    <div class="icon ${iconClass}">
                        <i class="${icon}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">
                            ${n.type.replace("_", " ")}
                            ${n.isRead ? '' : '<span class="badge">New</span>'}
                        </div>
                        <div class="notification-desc">${n.message}</div>
                        <div class="notification-meta">
                            <div class="notification-time">
                                <i class="far fa-clock"></i> ${new Date(n.createdAt).toLocaleString()}
                            </div>
                            <div class="notification-actions">
                                <button class="btn btn-sm btn-outline mark-as-${n.isRead ? 'unread' : 'read'}">
                                    Mark as ${n.isRead ? 'unread' : 'read'}
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                notificationContainer.appendChild(card);
            });

            document.querySelectorAll(".mark-as-read, .mark-as-unread").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.closest(".notification-card").dataset.id;
                    const endpoint = btn.classList.contains("mark-as-read")
                        ? `http://localhost:8080/api/notifications/${id}/read`
                        : `http://localhost:8080/api/notifications/${id}/unread`;
                    try {
                        await fetch(endpoint, {
                            method: "POST",
                            headers: { Authorization: "Bearer " + token }
                        });
                        loadNotifications(filter);
                    } catch (err) {
                        Swal.fire("Error", "Failed to update notification status", "error");
                    }
                });
            });

            const markAllBtn = document.querySelector('#provider-notifications .btn-light');
            if (markAllBtn) {
                markAllBtn.addEventListener("click", async () => {
                    try {
                        await fetch(`http://localhost:8080/api/notifications/user/${userId}/read-all`, {
                            method: "POST",
                            headers: { Authorization: "Bearer " + token }
                        });
                        loadNotifications(filter);
                    } catch (err) {
                        Swal.fire("Error", "Failed to mark all as read", "error");
                    }
                });
            }

            document.querySelectorAll('.job-filters .filter-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    let newFilter = "all";
                    if (tab.textContent.includes("Unread")) newFilter = "unread";
                    loadNotifications(newFilter);
                });
            });
        } catch (err) {
            console.error('Error loading notifications:', err);
            Swal.fire("Error", "Failed to load notifications", "error");
        }
    }


    // Handle "View All" button on Provider Dashboard
    const viewAllBtn = document.querySelector('#provider-dashboard .btn.btn-sm.btn-light');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById('provider-available-jobs').classList.add('active');
            providerLinks.forEach(l => l.classList.remove('active'));
            const availableJobsLink = document.querySelector(`a[data-page="provider-available-jobs"]`);
            if (availableJobsLink) availableJobsLink.classList.add('active');
            loadAvailableJobs(0, 10);
        });
    }

    // Logout
    const confirmLogout = document.getElementById('confirmLogout');
    if (confirmLogout) {
        confirmLogout.addEventListener('click', function () {
            localStorage.clear();
            Swal.fire({
                icon: 'success',
                title: 'Logged Out',
                text: 'You have been successfully logged out.',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = '/login.html?mode=login';
            });
        });
    }

    // Bell icon → switch to notifications page
    const bell = document.querySelector(".notification-bell");
    if (bell) {
        bell.addEventListener("click", () => {
            pages.forEach(p => p.classList.remove("active"));
            document.getElementById("provider-notifications").classList.add("active");
            providerLinks.forEach(l => l.classList.remove("active"));
            document.querySelector(`a[data-page="provider-notifications"]`).classList.add("active");
            loadNotifications();
        });
    }

    // ---------------- Init ----------------
    if (document.getElementById("provider-available-jobs")?.classList.contains("active")) loadAvailableJobs(0, 10);
    if (document.getElementById("provider-my-work")?.classList.contains("active")) loadMyWork(0, 10);
    if (document.getElementById("provider-notifications")?.classList.contains("active")) loadNotifications();
    if (document.getElementById("provider-profile")?.classList.contains("active")) loadProviderProfile();
    if (document.getElementById("opportunity-table")?.classList.contains("active")) loadOpportunities();
    loadOpportunities();
    loadProviderProfile();
    loadNotifications();
    loadAvailableJobs(0, 10);
    loadMyWork(0, 10);



    setInterval(() => {
        loadNotifications();
        loadOpportunities();
        loadAvailableJobs(0, 10);
        loadMyWork(0, 10);
        
    }, 30000);
});