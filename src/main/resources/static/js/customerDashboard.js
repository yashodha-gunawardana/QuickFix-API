document.addEventListener("DOMContentLoaded", function () {
    // Retrieve user data from localStorage
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('jwtToken');

    // Check authentication & role
    if (!token || !userId || role !== "CUSTOMER") {
        Swal.fire({
            icon: 'warning',
            title: 'Not Logged In',
            text: 'Please log in as a customer!',
        }).then(() => {
            window.location.href = "/login.html";
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

    if (role && document.getElementById("header-role")) {
        document.getElementById("header-role").textContent = role;
    }

    // ------------- Sidebar page switching --------------
    const customerLinks = document.querySelectorAll(".customer-links a");
    const pages = document.querySelectorAll(".page-content");

    customerLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const pageId = this.dataset.page;

            // Show selected page
            pages.forEach(p => p.classList.remove("active"));
            const activePage = document.getElementById(pageId);
            if (activePage) activePage.classList.add("active");

            // Highlight selected link
            customerLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");

            // Load page-specific data
            if (pageId === "customer-dashboard") loadRecentJobs();
            else if (pageId === "customer-my-jobs") loadMyJobs(0, 10);
            else if (pageId === "customer-notifications") loadNotifications();
            else if (pageId === "customer-post-job") {
                document.getElementById('job-form').reset();
                delete document.getElementById('job-form').dataset.jobId;
                document.querySelector('.btn-submit').textContent = 'Post Job';
            }
        });
    });

    // ------------- Recent jobs (dashboard) --------------
    function loadRecentJobs(maxJobs = 5) {
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Not Logged In',
                text: 'Please log in to view your jobs.',
                confirmButtonText: 'Go to Login'
            }).then(() => {
                window.location.href = '/login.html';
            });
            return;
        }

        fetch(`http://localhost:8080/api/jobs/my-jobs?page=0&size=${maxJobs}&sort=created_at,desc`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        return response.json().then(data => {
                            throw new Error(data.message || 'Unauthorized: Invalid or expired token.');
                        });
                    }
                    if (response.status === 403) {
                        throw new Error('Forbidden: Only customers can view jobs.');
                    }
                    if (response.status === 500) {
                        return response.json().then(data => {
                            throw new Error(`Server error: ${data.message || 'Internal Server Error'}`);
                        });
                    }
                    throw new Error(`Failed to fetch recent jobs: Server returned ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const jobs = Array.isArray(data) ? data : (data.content || []);
                const tbody = document.querySelector('#customer-dashboard .job-table tbody');
                tbody.innerHTML = ''; // Clear existing rows

                if (jobs.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No recent jobs found.</td></tr>';
                } else {
                    jobs.forEach(job => {
                        const row = document.createElement('tr');
                        const actions = job.status === 'PENDING' ? `
                <button class="btn btn-sm btn-warning edit-btn" data-job-id="${job.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-btn" data-job-id="${job.id}"><i class="fas fa-trash"></i></button>
            ` : '';
                        row.innerHTML = `
                <td>${job.title}</td>
                <td>${job.category ? job.category.charAt(0).toUpperCase() + job.category.slice(1) : '-'}</td>
                <td>${job.datePosted || '-'}</td>
                <td><span class="badge-${job.status ? job.status.toLowerCase() : 'unknown'}">${job.status || '-'}</span></td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-primary view-btn" data-job-id="${job.id}"><i class="fas fa-eye"></i></button>
                        ${actions}
                    </div>
                </td>
            `;
                        tbody.appendChild(row);
                    });
                }
            })

            .catch(error => {
                console.error('Error fetching recent jobs:', error);
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
            });
    }

    // ------------- My jobs --------------
    function loadMyJobs(page = 0, size = 10) {
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Not Logged In',
                text: 'Please log in to view your jobs.',
                confirmButtonText: 'Go to Login'
            }).then(() => {
                window.location.href = '/login.html';
            });
            return;
        }

        fetch(`http://localhost:8080/api/jobs/my-jobs?page=${page}&size=${size}&sort=created_at,desc`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        return response.json().then(data => {
                            throw new Error(data.message || 'Unauthorized: Invalid or expired token.');
                        });
                    }
                    if (response.status === 403) {
                        throw new Error('Forbidden: Only customers can view jobs.');
                    }
                    if (response.status === 500) {
                        return response.json().then(data => {
                            throw new Error(`Server error: ${data.message || 'Internal Server Error'}`);
                        });
                    }
                    throw new Error(`Failed to fetch jobs: Server returned ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const jobs = data.content || [];           // Use the content array
                const totalItems = data.totalElements || 0; // Total number of jobs
                const totalPages = data.totalPages || 1;   // Total pages

                const tbody = document.querySelector('.myJob-table tbody');
                tbody.innerHTML = ''; // Clear existing rows

                if (jobs.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No jobs found.</td></tr>';
                } else {
                    jobs.forEach(job => {
                        const row = document.createElement('tr');
                        const actions = job.status === 'PENDING' ? `
                    <button class="btn btn-sm btn-warning edit-btn" data-job-id="${job.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-btn" data-job-id="${job.id}"><i class="fas fa-trash"></i></button>
                ` : '';
                        row.innerHTML = `
                    <td>${job.title}</td>
                    <td>${job.category.charAt(0).toUpperCase() + job.category.slice(1)}</td>
                    <td>${job.datePosted}</td>
                    <td><span class="badge-${job.status.toLowerCase()}">${job.status}</span></td>
                    <td>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-info view-btn" data-job-id="${job.id}"><i class="fas fa-eye"></i></button>
                            ${actions}
                        </div>
                    </td>
                `;
                        tbody.appendChild(row);
                    });
                }

                // Update pagination info
                const pageInfo = document.querySelector('#customer-my-jobs .page-info');
                pageInfo.textContent = `Showing ${page * size + 1} to ${Math.min((page + 1) * size, totalItems)} of ${totalItems} entries`;

                // Update pagination controls
                updatePagination(page, size, totalPages);
            })
            .catch(error => {
                console.error('Error fetching jobs:', error);
                Swal.fire('Error', error.message, 'error');
                if (error.message.includes('Unauthorized')) {
                    localStorage.clear();
                    window.location.href = '/login.html';
                }
            });
    }


    function loadDashboardStats() {
        if (!token) return;

        fetch('http://localhost:8080/api/jobs/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(stats => {
                document.getElementById("stat-jobs-posted").textContent = stats.jobsPosted;
                document.getElementById("stat-completed-jobs").textContent = stats.completedJobs;
                document.getElementById("stat-active-time").textContent = stats.activeTime + "h";
            })
            .catch(err => console.error("Error loading dashboard stats:", err));
    }


    // ------------- Pagination --------------
    function updatePagination(page, size, totalPages) {
        const pagination = document.querySelector('#customer-my-jobs .pagination');
        pagination.innerHTML = '';

        const ul = document.createElement('ul');
        ul.className = 'pagination';

        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${page === 0 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#">Prev</a>`;
        if (page > 0) {
            prevLi.addEventListener('click', (e) => {
                e.preventDefault();
                loadMyJobs(page - 1, size);
            });
        }
        ul.appendChild(prevLi);

        // Page numbers (show up to 5 pages around current page)
        const maxPagesToShow = 5;
        const startPage = Math.max(0, page - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

        for (let i = startPage; i <= endPage; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === page ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
            if (i !== page) {
                pageLi.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadMyJobs(i, size);
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
                loadMyJobs(page + 1, size);
            });
        }
        ul.appendChild(nextLi);

        pagination.appendChild(ul);
    }

    // ------------- Job actions (view, edit, delete) --------------
    document.addEventListener('click', function (e) {
        const jobId = e.target.closest('button')?.dataset.jobId;
        if (!jobId) return;

        // Helper function to safely parse JSON response
        const parseJsonSafe = async (response) => {
            try {
                // Check if response has a body
                const contentLength = response.headers.get('content-length');
                if (contentLength === '0' || !response.body) {
                    return { message: response.statusText || 'No content returned' };
                }
                // Check content-type
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    return { message: response.statusText || 'Invalid response format' };
                }
                return await response.json();
            } catch (error) {
                console.error('JSON parsing error:', error);
                return { message: response.statusText || 'Failed to parse response' };
            }
        };

        if (e.target.closest('.view-btn')) {
            fetch(`http://localhost:8080/api/jobs/view/${jobId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(async response => {
                    if (!response.ok) {
                        const data = await parseJsonSafe(response);
                        if (response.status === 401) throw new Error('Unauthorized: Invalid or expired token.');
                        if (response.status === 403) throw new Error(data.message || 'Forbidden: You can only view your own jobs.');
                        if (response.status === 404) throw new Error(data.message || 'Job not found.');
                        if (response.status === 500) throw new Error(data.message || 'Internal Server Error');
                        throw new Error(`Failed to fetch job: Server returned ${response.status}`);
                    }
                    return response.json();
                })
                .then(job => {
                    Swal.fire({
                        icon: 'info',
                        title: job.title,
                        html: `
                            <p><strong>Category:</strong> ${job.category.charAt(0).toUpperCase() + job.category.slice(1)}</p>
                            <p><strong>Description:</strong> ${job.description}</p>
                            <p><strong>Budget:</strong> $${job.budget || 'N/A'}</p>
                            <p><strong>Location:</strong> ${job.location}</p>
                            <p><strong>Preferred Date:</strong> ${job.preferredDate || 'N/A'}</p>
                            <p><strong>Preferred Time:</strong> ${job.preferredTime || 'N/A'}</p>
                            <p><strong>Status:</strong> ${job.status}</p>
                            <p><strong>Date Posted:</strong> ${job.datePosted}</p>
                        `,
                        confirmButtonText: 'OK'
                    });
                })
                .catch(error => {
                    console.error('Error fetching job details:', error);
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
                });
        } else if (e.target.closest('.edit-btn')) {
            fetch(`http://localhost:8080/api/jobs/view/${jobId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(async response => {
                    if (!response.ok) {
                        const data = await parseJsonSafe(response);
                        if (response.status === 401) throw new Error('Unauthorized: Invalid or expired token.');
                        if (response.status === 403) throw new Error(data.message || 'Forbidden: You can only edit your own jobs.');
                        if (response.status === 400) throw new Error(data.message || 'Only PENDING jobs can be updated.');
                        if (response.status === 404) throw new Error(data.message || 'Job not found.');
                        if (response.status === 500) throw new Error(data.message || 'Internal Server Error');
                        throw new Error(`Failed to fetch job: Server returned ${response.status}`);
                    }
                    return response.json();
                })
                .then(job => {
                    // Navigate to Post Job page and prefill form
                    pages.forEach(p => p.classList.remove('active'));
                    document.getElementById('customer-post-job').classList.add('active');
                    customerLinks.forEach(l => l.classList.remove('active'));
                    document.querySelector(`a[data-page="customer-post-job"]`).classList.add('active');

                    // Prefill form
                    document.getElementById('job-title').value = job.title;
                    document.getElementById('job-category').value = job.category;
                    document.getElementById('job-description').value = job.description;
                    document.getElementById('job-budget').value = job.budget || '';
                    document.getElementById('job-location').value = job.location;
                    document.getElementById('job-date').value = job.preferredDate || '';
                    document.getElementById('job-time').value = job.preferredTime || '';

                    // Change form submission to update job
                    const jobForm = document.getElementById('job-form');
                    jobForm.dataset.jobId = jobId;
                    document.querySelector('.btn-submit').textContent = 'Update Job';
                })
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Edit Job',
                        text: 'You can now edit the job details.',
                        confirmButtonText: 'OK'
                    });
                })
                .catch(error => {
                    console.error('Error fetching job for edit:', error);
                    Swal.fire({
                        icon: error.message.includes('PENDING') ? 'warning' : 'error',
                        title: 'Error',
                        text: error.message,
                        confirmButtonText: 'OK'
                    }).then(() => {
                        if (error.message.includes('Unauthorized')) {
                            localStorage.clear();
                            window.location.href = '/login.html';
                        }
                    });
                });
        } else if (e.target.closest('.delete-btn')) {
            Swal.fire({
                title: 'Delete Job?',
                text: 'Are you sure you want to delete this job? This action cannot be undone.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(`http://localhost:8080/api/jobs/delete/${jobId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    })
                        .then(async response => {
                            if (!response.ok) {
                                const data = await parseJsonSafe(response);
                                if (response.status === 401) throw new Error('Unauthorized: Invalid or expired token.');
                                if (response.status === 403) throw new Error(data.message || 'Forbidden: You can only delete your own jobs.');
                                if (response.status === 400) throw new Error(data.message || 'Cannot delete this job. Only PENDING jobs can be deleted.');
                                if (response.status === 404) throw new Error(data.message || 'Job not found.');
                                if (response.status === 500) throw new Error(data.message || 'Internal Server Error');
                                throw new Error(`Failed to delete job: Server returned ${response.status}`);
                            }
                            // Handle successful deletion (204 No Content or JSON response)
                            const contentType = response.headers.get('content-type');
                            if (contentType && contentType.includes('application/json')) {
                                return response.json();
                            }
                            return {}; // Return empty object for non-JSON responses (e.g., 204)
                        })
                        .then(() => {
                            Swal.fire({
                                icon: 'success',
                                title: 'Job Deleted',
                                text: 'The job has been successfully deleted.',
                                confirmButtonText: 'OK'
                            }).then(() => {
                                loadMyJobs(0, 10);
                                if (document.getElementById('customer-dashboard').classList.contains('active')) {
                                    loadRecentJobs(5);
                                }
                            });
                        })
                        .catch(error => {
                            console.error('Error deleting job:', error);
                            Swal.fire({
                                icon: error.message.includes('PENDING') ? 'warning' : 'error',
                                title: 'Error',
                                text: error.message,
                                confirmButtonText: 'OK'
                            }).then(() => {
                                if (error.message.includes('Unauthorized')) {
                                    localStorage.clear();
                                    window.location.href = '/login.html';
                                }
                            });
                        });
                }
            });
        }
    });

    // ------------- Post/update job --------------
    const jobForm = document.getElementById('job-form');
    if (jobForm) {
        jobForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Collect form data
            const jobData = {
                title: document.getElementById('job-title').value.trim(),
                category: document.getElementById('job-category').value,
                description: document.getElementById('job-description').value.trim(),
                budget: parseFloat(document.getElementById('job-budget').value) || null,
                location: document.getElementById('job-location').value.trim(),
                preferredDate: document.getElementById('job-date').value || null,
                preferredTime: document.getElementById('job-time').value || null
            };

            // Validate required fields
            if (!jobData.title || !jobData.category || !jobData.description || !jobData.location) {
                Swal.fire({
                    icon: 'error',
                    title: 'Missing Fields',
                    text: 'Please fill in all required fields (Title, Category, Description, Location).',
                    confirmButtonText: 'OK'
                });
                return;
            }

            // Get JWT token from localStorage
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Not Logged In',
                    text: 'You must be logged in to post or update a job.',
                    confirmButtonText: 'Go to Login'
                }).then(() => {
                    window.location.href = '/login.html';
                });
                return;
            }

            // Determine if creating or updating
            const jobId = jobForm.dataset.jobId;
            const isUpdate = !!jobId;
            const url = isUpdate ? `http://localhost:8080/api/jobs/update/${jobId}` : 'http://localhost:8080/api/jobs/post-job';
            const method = isUpdate ? 'PUT' : 'POST';

            // Send request
            fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(jobData)
            })
                .then(response => {
                    if (!response.ok) {
                        if (response.status === 401) {
                            return response.json().then(data => {
                                throw new Error(data.message || 'Unauthorized: Invalid or expired token.');
                            });
                        }
                        if (response.status === 403) {
                            throw new Error(`Forbidden: Only customers can ${isUpdate ? 'update' : 'post'} jobs.`);
                        }
                        if (response.status === 400) {
                            throw new Error(isUpdate ? 'Only PENDING jobs can be updated.' : 'Bad Request: Invalid input data.');
                        }
                        if (response.status === 404) {
                            throw new Error('Job not found.');
                        }
                        if (response.status === 500) {
                            return response.json().then(data => {
                                throw new Error(`Server error: ${data.message || 'Internal Server Error'}`);
                            });
                        }
                        throw new Error(`Failed to ${isUpdate ? 'update' : 'post'} job: Server returned ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (isUpdate) {
                        // Single alert for update
                        Swal.fire({
                            icon: 'success',
                            title: 'Job Updated Successfully..!',
                            text: 'Your job has been updated.',
                            confirmButtonText: 'OK'
                        }).then(() => {
                            jobForm.reset();
                            delete jobForm.dataset.jobId; // Clear jobId
                            document.querySelector('.btn-submit').textContent = 'Post Job';
                            // Navigate back to My Jobs page
                            pages.forEach(p => p.classList.remove('active'));
                            document.getElementById('customer-my-jobs').classList.add('active');
                            customerLinks.forEach(l => l.classList.remove('active'));
                            document.querySelector(`a[data-page="customer-my-jobs"]`).classList.add('active');
                            loadMyJobs(0, 10);
                        });
                    } else {
                        // Two alerts for new job post
                        Swal.fire({
                            icon: 'success',
                            title: 'Job Posted Successfully..!',
                            text: 'Your job has been posted and is now visible to service providers.',
                            confirmButtonText: 'Post Another Job'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Job Live!',
                                    text: 'Your job is now live and can be viewed by service providers.',
                                    confirmButtonText: 'OK'
                                }).then(() => {
                                    jobForm.reset();
                                    delete jobForm.dataset.jobId; // Clear jobId
                                    document.querySelector('.btn-submit').textContent = 'Post Job';
                                });
                            }
                        });
                    }
                })
                .catch(error => {
                    console.error(`Error ${isUpdate ? 'updating' : 'posting'} job:`, error);
                    Swal.fire({
                        icon: error.message.includes('PENDING') ? 'warning' : 'error',
                        title: 'Error',
                        text: error.message,
                        confirmButtonText: 'OK'
                    }).then(() => {
                        if (error.message.includes('Unauthorized')) {
                            localStorage.clear();
                            window.location.href = '/login.html';
                        }
                    });
                });
        });
    }

    // Handle "Post Another Job" button
    const postAnotherJobBtn = document.getElementById('post-another-job');
    if (postAnotherJobBtn) {
        postAnotherJobBtn.addEventListener('click', () => {
            document.getElementById('job-form').reset();
            delete document.getElementById('job-form').dataset.jobId;
            document.querySelector('.btn-submit').textContent = 'Post Job';
        });
    }

    // Handle Cancel button on Post Job page
    const cancelBtn = document.querySelector('#cancel-form');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'Cancel Job Posting?',
                text: 'Are you sure you want to cancel? Any unsaved changes will be lost.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, cancel',
                cancelButtonText: 'No, continue editing'
            }).then((result) => {
                if (result.isConfirmed) {
                    const jobForm = document.getElementById('job-form');
                    jobForm.reset();
                    delete jobForm.dataset.jobId; // Clear jobId for create mode
                    document.querySelector('.btn-submit').textContent = 'Post Job';
                    // Navigate to My Jobs page
                    pages.forEach(p => p.classList.remove('active'));
                    document.getElementById('customer-my-jobs').classList.add('active');
                    customerLinks.forEach(l => l.classList.remove('active'));
                    document.querySelector(`a[data-page="customer-my-jobs"]`).classList.add('active');
                    loadMyJobs(0, 10);
                }
            });
        });
    }

    // Handle "View All" button on Customer Dashboard
    const viewAllBtn = document.querySelector('#customer-dashboard .btn.btn-sm.btn-light');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById('customer-my-jobs').classList.add('active');
            customerLinks.forEach(l => l.classList.remove('active'));
            const myJobsLink = document.querySelector(`a[data-page="customer-my-jobs"]`);
            if (myJobsLink) myJobsLink.classList.add('active');
            loadMyJobs(0, 10);
        });
    }

    // Become provider
    const requestProviderBtn = document.getElementById('request-provider-btn');
    if (requestProviderBtn) {
        requestProviderBtn.addEventListener('click', function () {
            if (!userId || !token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Not Logged In',
                    text: 'You must be logged in to request provider status.',
                    confirmButtonText: 'Go to Login'
                }).then(() => {
                    window.location.href = '/login.html';
                });
                return;
            }

            Swal.fire({
                title: 'Become a Provider?',
                text: 'Do you want to request to become a service provider?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, request it!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch('http://localhost:8080/api/customer/request-provider', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ userId: parseInt(userId) })
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                            }
                            return response.json();
                        })
                        .then(data => {
                            Swal.fire({
                                icon: 'success',
                                title: 'Request Sent!',
                                text: data.message || 'Your request to become a provider has been sent.',
                                confirmButtonText: 'OK'
                            });
                        })
                        .catch(error => {
                            console.error('Error requesting provider status:', error);
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: error.message,
                                confirmButtonText: 'OK'
                            });
                        });
                }
            });
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
                text: 'You have been successfully logged out..!',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = '/login.html?mode=login';
            });
        });
    }

    // ------------- Notifications --------------
    async function loadNotifications(filter = "all") {
        try {
            // Fetch notification counts
            const countRes = await fetch(`http://localhost:8080/api/notifications/user/${userId}/count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!countRes.ok) throw new Error("Failed to fetch notification count");
            const { count } = await countRes.json();

            // Update header and sidebar badges
            const headerBadge = document.getElementById('header-notification-badge');
            const sidebarBadge = document.querySelector('.customer-links a[data-page="customer-notifications"] .badge');
            if (headerBadge) {
                headerBadge.textContent = count;
                headerBadge.style.display = count > 0 ? 'flex' : 'none';
            }
            if (sidebarBadge) {
                sidebarBadge.textContent = count;
                sidebarBadge.style.display = count > 0 ? 'inline-block' : 'none';
            }

            // Fetch all notifications
            const allRes = await fetch(`http://localhost:8080/api/notifications/user/${userId}/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!allRes.ok) throw new Error("Failed to fetch notifications");
            const allNotifications = await allRes.json();

            // Filter notifications if needed
            let filteredNotifications = allNotifications;
            if (filter === "unread") {
                filteredNotifications = allNotifications.filter(n => !n.isRead);
            }

            // Update tab badges
            const allCount = allNotifications.length;
            const unreadCount = allNotifications.filter(n => !n.isRead).length;
            const tabs = document.querySelectorAll('.user-filters .filter-tab');
            if (tabs[0]) tabs[0].querySelector('.badge').textContent = allCount;
            if (tabs[1]) tabs[1].querySelector('.badge').textContent = unreadCount;

            // Set active tab
            tabs.forEach(tab => tab.classList.remove('active'));
            const activeTab = filter === "all" ? tabs[0] : tabs[1];
            if (activeTab) activeTab.classList.add('active');

            // Render notifications
            const notificationContainer = document.querySelector("#customer-notifications .notifications");
            if (!notificationContainer) return;
            notificationContainer.innerHTML = "";

            if (filteredNotifications.length === 0) {
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
                    case "PROVIDER_APPROVED":
                        iconClass = "success";
                        icon = "fas fa-user-check";
                        break;
                    case "PROVIDER_REJECTED":
                        iconClass = "danger";
                        icon = "fas fa-user-times";
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

            // Mark as read/unread button
            document.querySelectorAll(".mark-as-read, .mark-as-unread").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.closest(".notification-card").dataset.id;
                    const endpoint = btn.classList.contains("mark-as-read")
                        ? `http://localhost:8080/api/notifications/${id}/read`
                        : `http://localhost:8080/api/notifications/${id}/unread`;
                    try {
                        await fetch(endpoint, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
                        loadNotifications(filter);
                    } catch (err) {
                        Swal.fire("Error", "Failed to update notification status", "error");
                    }
                });
            });


            // Mark all as read
            document.getElementById("mark-all-read")?.addEventListener("click", async () => {
                await fetch(`http://localhost:8080/api/notifications/user/${userId}/read-all`, {
                    method: "POST", headers: { Authorization: "Bearer " + token }
                });
                loadNotifications(filter);
            });

            // Tab click filter
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const newFilter = tab.dataset.filter;
                    loadNotifications(newFilter);
                });
            });

        } catch (err) {
            console.error("Error loading notifications:", err);
            Swal.fire("Error", "Failed to load notifications", "error");
        }
    }

    // Bell icon → switch to notifications page
    const bell = document.querySelector(".notification-bell");
    if (bell) {
        bell.addEventListener("click", () => {
            pages.forEach(p => p.classList.remove("active"));
            document.getElementById("customer-notifications").classList.add("active");
            customerLinks.forEach(l => l.classList.remove("active"));
            document.querySelector(`a[data-page="customer-notifications"]`).classList.add("active");
            loadNotifications();
        });
    }


    // -------------------- Load Customer Profile --------------------
    async function loadCustomerProfile() {
        try {
            const res = await fetch(`http://localhost:8080/api/profile/customer/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                let errorMessage = `HTTP error! status: ${res.status}`;
                try {
                    const errorData = await res.json();
                    errorMessage += `, message: ${errorData.message || 'Unknown error'}`;
                } catch {
                    const errorText = await res.text();
                    errorMessage += `, message: ${errorText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await res.json();
            console.log("Response data:", data);

            const profileData = data.data || data;
            const userData = profileData.user || {};

            // Profile image
            const profileImageUrl = profileData.profileImage
                ? `/api/profile/image/${profileData.profileImage}?t=${new Date().getTime()}`
                : "https://placehold.co/128x128/6366f1/ffffff?text=User";
            document.getElementById("customer-profileImage").src = profileImageUrl;
            document.getElementById("header-profile-image").src = profileImageUrl;


            // Contact info
            document.getElementById("firstName").innerText = `${profileData.firstName || ""} ${profileData.lastName || ""}`;
            document.getElementById("contactEmail").innerText = profileData.email || "undefined";
            document.getElementById("contactPhone").innerText = profileData.phoneNo || "undefined";
            document.getElementById("contactAddress").innerText = profileData.address || "undefined";

            document.getElementById("header-name").innerText = `${profileData.firstName || ""} ${profileData.lastName || ""}`;

            // Form fields
            document.getElementById("customer-first-name").value = profileData.firstName || "";
            document.getElementById("customer-last-name").value = profileData.lastName || "";
            document.getElementById("customer-email").value = profileData.email || "";
            document.getElementById("customer-phone").value = profileData.phoneNo || "";
            document.getElementById("customer-address").value = profileData.address || "";
            document.getElementById("customer-bio").value = profileData.bio || "";

        } catch (error) {
            console.error("Error loading profile:", error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: `Failed to load profile: ${error.message}`
            });
        }
    }


    // -------------------- Image Preview on File Select --------------------
    document.getElementById("imageFile").addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Update profile page image
                document.getElementById("customer-profileImage").src = e.target.result;
                // Update header image
                document.getElementById("header-profile-image").src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // -------------------- Handle Profile Update --------------------
    document.getElementById("customer-profile-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();

        // JSON part
        const profileData = {
            firstName: document.getElementById("customer-first-name").value,
            lastName: document.getElementById("customer-last-name").value,
            email: document.getElementById("customer-email").value,
            phoneNo: document.getElementById("customer-phone").value,
            address: document.getElementById("customer-address").value,
            bio: document.getElementById("customer-bio").value
        };
        formData.append("customerProfile", new Blob([JSON.stringify(profileData)], { type: "application/json" }));


        // Image part
        const fileInput = document.getElementById("imageFile");
        const file = fileInput.files[0];
        if (file) {
            formData.append("image", file);
        }

        try {
            const res = await fetch(`/api/profile/customer/${userId}`, {
                method: "PUT",
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json(); // read only once
            const profileData = data.data || data;
            const userData = profileData.user || {};

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Profile updated successfully!'
                });

              //  const profileImageEl = document.getElementById("customer-profileImage");

               /* if (file) {
                    // Show uploaded image immediately in profile and header
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        document.getElementById("customer-profileImage").src = e.target.result;
                        document.getElementById("header-profile-image").src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                } else {
                    // Reload backend image with cache-busting
                    const data = await res.json();
                    const profileData = data.data || data;
                    const profileImageUrl = profileData.profileImage
                        ? `/api/profile/image/${profileData.profileImage}?t=${new Date().getTime()}`
                        : "https://placehold.co/128x128/6366f1/ffffff?text=User";
                    document.getElementById("customer-profileImage").src = profileImageUrl;
                    document.getElementById("header-profile-image").src = profileImageUrl;
                }


                // Reload only other profile info (not image)
                const profileData = await res.json();
                const userData = profileData.data?.user || {};
                document.getElementById("firstName").innerText = `${profileData.data?.firstName || ""} ${profileData.data?.lastName || ""}`;
                document.getElementById("contactEmail").innerText = userData.email || "undefined";
                document.getElementById("contactPhone").innerText = profileData.data?.phoneNo || "undefined";
                document.getElementById("contactAddress").innerText = profileData.data?.address || "undefined";*/
                // Update profile image
                const profileImageUrl = profileData.profileImage
                    ? `/api/profile/image/${profileData.profileImage}?t=${new Date().getTime()}`
                    : "https://placehold.co/128x128/6366f1/ffffff?text=User";
                document.getElementById("customer-profileImage").src = profileImageUrl;
                document.getElementById("header-profile-image").src = profileImageUrl;

                // Update profile info
                document.getElementById("firstName").innerText = `${profileData.firstName || ""} ${profileData.lastName || ""}`;
                document.getElementById("contactEmail").innerText = profileData.email || "undefined";
                document.getElementById("contactPhone").innerText = profileData.phoneNo || "undefined";
                document.getElementById("contactAddress").innerText = profileData.address || "undefined";

                // Update form fields
                document.getElementById("customer-first-name").value = profileData.firstName || "";
                document.getElementById("customer-last-name").value = profileData.lastName || "";
                document.getElementById("customer-email").value = profileData.email || "";
                document.getElementById("customer-phone").value = profileData.phoneNo || "";
                document.getElementById("customer-address").value = profileData.address || "";
                document.getElementById("customer-bio").value = profileData.bio || "";


            } else {
                const errorText = await res.text();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Failed to update profile: ${errorText}`
                });
            }

        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to update profile: ${err.message}`
            });
        }
    });





    // Init + refresh
    if (document.getElementById("customer-dashboard")?.classList.contains("active")) loadRecentJobs();
    if (document.getElementById("customer-my-jobs")?.classList.contains("active")) loadMyJobs(0, 10);
    if (document.getElementById("customer-notifications")?.classList.contains("active")) loadNotifications();
    if (document.getElementById("customer-profile")?.classList.contains("active")) loadCustomerProfile();
    loadNotifications(); // Initial load for badges
    loadCustomerProfile();
    setInterval(loadNotifications, 30000);


});