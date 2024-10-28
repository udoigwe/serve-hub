$(function () {

    'use strict';

    let token = sessionStorage.getItem('token');

	$(document).ready(function(){

        loadArtists();
        loadAlbums();
        dataTableAlertPrevent('table');

        var f1 = flatpickr(document.getElementsByClassName('flatpicker'), {
            //enableTime: true,
            dateFormat: "Y-m-d",
            disableMobile: "true",
            altInput: true, // Use an alternate input field
            altFormat: "Y-m-d", // Format for the alternate input field
        });

        $('#albums').on('click', '.btn-edit', function(){
            var albumID = $(this).parents('tr').attr('id');
            var editModal = $('#editModal');

            //fetch artist details
            $.ajax({
                url: API_URL_ROOT+'/albums/'+albumID,
                type: 'GET',
                dataType: 'json',
                headers:{'x-access-token':token},
                success: function(response)
                {
                    if(response.error == false)
                    {
                        var album = response.album;
                        
                        editModal.find('.modal-title').text(album.album_title);
                        editModal.find('.album_title').val(album.album_title);
                        editModal.find('.artist_id').val(album.artist_id);
                        editModal.find('.album_release_date').val(album.album_release_date);
                        editModal.find('.feature_status').val(album.feature_status);
                        editModal.find('.album_status').val(album.album_status);
                        editModal.find('.album_id').val(album.album_id);
                        editModal.find('.selectpicker').selectpicker('refresh');
                    }
                    else
                    {
                        showSimpleMessage("Attention", response.message, "error");   
                    }
                },
                error: function(req, status, error)
                {
                    showSimpleMessage("Attention", req.responseJSON.message, "error");
                }
            });
        }); 

        $('#albums').on('click', '.btn-delete', function(){
            var albumID = $(this).parents('tr').attr('id');
            deleteAlbum(albumID);  
        });

        //submit album
        $('#new-album').on('submit', function(e){
            e.preventDefault();
            newAlbum();
        });

        //edit album
        $('#updateAlbum').on('submit', function(e){
            e.preventDefault();
            updateAlbum();
        });
    });

    //internal function to add new album
    function newAlbum() 
    {
        swal({
            title: "Attention",
            text: "Are you sure you want to create this album?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No!"
        }).then(function(result){

            if (result.value) 
            {
                //name vairables
                var form = $('#new-album'); //form
                var avatar = form.find(".cover_image").val(); //media from form
                var validFileExtensions = ['jpeg','jpg', 'png'];
                var table = $('#albums').DataTable();
                var fields = form.find('input.required, select.required');  
                //Create array with the file extensions that we wish to upload
                var validFileExtensions = ['jpeg', 'jpg', 'png'];

                blockUI();       

                for(var i=0;i<fields.length;i++)
                {
                    if(fields[i].value == "")
                    {
                        /*alert(fields[i].id);*/
                        unblockUI();
                        showSimpleMessage("Attention", `${fields[i].name} is required`, "error");
                        $('#'+fields[i].id).focus();
                        return false;
                    }
                }  
                
                var extension = avatar.split('.').pop().toLowerCase();

                if($.inArray(extension, validFileExtensions) == -1)
                {
                    //invalid avatar format
                    unblockUI();
                    form.find(".cover_image").focus();
                    showSimpleMessage("Attention", "Avatar must be a jpeg, jpg, png file formats", "error");
                    return false;
                } 
                
                if(form.find(".cover_image").get(0).files[0].size > (1024 * 1024)) 
                {
                    //avatar is more than 1MB
                    unblockUI();
                    form.find(".cover_image").focus();
                    showSimpleMessage("Attention", "Avatar must not be more than 1MB in size", "error");
                    return false;
                } 

                $.ajax({
                    type: 'POST',
                    url: API_URL_ROOT+'/albums',
                    data: new FormData(form[0]),
                    dataType: 'json',
                    contentType: false,
                    processData: false,
                    cache: false,
                    headers:{'x-access-token':token},
                    success: function(response)
                    {
                        if(response.error == false)
                        {
                            unblockUI();
                            showSimpleMessage("Attention", response.message, "success");
                            form.get(0).reset();
                            $('.selectpicker').selectpicker('refresh');
                            table.ajax.reload(null, false);
                        }
                        else
                        {
                            unblockUI();
                            showSimpleMessage("Attention", response.message, "error");
                        }  
                    },
                    error: function(req, status, error)
                    {
                        unblockUI();
                        showSimpleMessage("Attention", req.responseJSON.message, "error");
                    }
                });   
            } 
            else 
            {
                showSimpleMessage('Canceled', 'Process Abborted', 'error');
            }
        }); 
    }

    //internal function to update album
    function updateAlbum() 
    {
        swal({
            title: "Attention",
            text: "Are you sure you want to update this album?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No!"
            /*closeOnConfirm: false,
            closeOnCancel: false*/
        }).then(function(result){

            if (result.value) 
            {
                //name vairables
                var form = $('#updateAlbum'); //form
                var avatar = form.find(".cover_image").val();
                var editModal = $('#editModal');
                var albumID = form.find('.album_id').val();
                var table = $('#albums').DataTable();
                var fields = form.find('input.required, select.required');

                blockUI();

                for(var i=0;i<fields.length;i++)
                {
                    if(fields[i].value == "")
                    {
                        /*alert(fields[i].id);*/
                        unblockUI();  
                        showSimpleMessage("Attention", `${fields[i].name} is required`, "error");
                        $('#'+fields[i].id).focus();
                        return false;
                    }
                }

                if(avatar)
                {
                    var extension = avatar.split('.').pop().toLowerCase();
                    //Create array with the file extensions that we wish to upload
                    var validFileExtensions = ['jpeg', 'jpg', 'png'];
            
                    if($.inArray(extension, validFileExtensions) == -1)
                    {
                        //invalid avatar format
                        unblockUI();
                        form.find(".cover_image").focus();
                        showSimpleMessage("Attention", "Avatar must be a jpeg, jpg, png, gif file formats", "error");
                        return false;
                    } 
                    
                    if(form.find(".cover_image").get(0).files[0].size > (1024 * 1024)) 
                    {
                        //user image is more than 1MB
                        unblockUI();
                        form.find(".cover_image").focus();
                        showSimpleMessage("Attention", "Avatar must not be more than 1MB in size", "error");
                        return false;
                    } 
                }

                $.ajax({
                    type: 'PUT',
                    url: `${API_URL_ROOT}/albums/${albumID}`,
                    data: new FormData(form[0]),
                    dataType: 'json',
                    contentType: false,
                    processData: false,
                    cache: false,
                    headers:{'x-access-token':token},
                    success: function(response)
                    {
                        if(response.error == false)
                        {
                            unblockUI();
                            showSimpleMessage("Success", response.message, "success");
                            form.find(".cover_image").val('');
                            editModal.find(".close").click();
                            table.ajax.reload(null, false);
                        }
                        else
                        {
                            unblockUI();
                            showSimpleMessage("Attention", response.message, "error");
                        }   
                    },
                    error: function(req, status, error)
                    {
                        unblockUI();
                        showSimpleMessage("Attention", req.responseJSON.message, "error");
                    }
                });   
            } 
            else 
            {
                showSimpleMessage('Canceled', 'Process Abborted', 'error');
            }
        });
    }

    //internal function to delete album
    function deleteAlbum(albumID) 
    {
        swal({
            title: "Attention",
            text: "Are you sure you want to delete this album?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No!"
            /*closeOnConfirm: false,
            closeOnCancel: false*/
        }).then(function(result){

            if (result.value) 
            {
                //name vairables
                var table = $('#albums');
                var rowCount = table.find('tbody tr').length;
                blockUI();         

                $.ajax({
                    type: 'DELETE',
                    url: API_URL_ROOT+'/albums/'+albumID,
                    dataType: 'json',
                    headers: {'x-access-token':token},
                    success: function(response)
                    {
                        if(response.error == false)
                        {
                            unblockUI();
                            showSimpleMessage("Success", response.message, "success");
                            table.DataTable().ajax.reload(null, false)
                        }
                        else
                        {
                            unblockUI();
                            showSimpleMessage("Attention", response.message, "error");
                        }
                    },
                    error: function(req, status, error)
                    {
                        unblockUI();
                        showSimpleMessage("Attention", req.responseJSON.message, "error");
                    }
                });
            } 
            else 
            {
                showSimpleMessage('Canceled', 'Process Abborted', 'error');
            }
        });
    }

    //load aalbums
    function loadAlbums()
    {
        var table = $('#albums');

        table.DataTable({
            dom: `<"row"<"col-md-12"<"row"<"col-md-4"l><"col-md-4"B><"col-md-4"f>>><"col-md-12"rt><"col-md-12"<"row"<"col-md-5"i><"col-md-7"p>>>>`,
            buttons: {
                buttons: [
                    { extend: 'copy', className: 'btn' },
                    { extend: 'csv', className: 'btn' },
                    { extend: 'excel', className: 'btn' },
                    { extend: 'print', className: 'btn' },
                ]
            },
            oLanguage: {
                oPaginate: { 
                    sPrevious: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>', "sNext": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' 
                },
                sInfo: "Showing _START_ to _END_ of _TOTAL_ entries",
                sSearch: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
                sSearchPlaceholder: "Search...",
               sLengthMenu: "Results :  _MENU_",
            },
            lengthMenu: [7, 10, 20, 50, 100, 500, 1000],
            stripeClasses: [],
            drawCallback: function () { $('.dataTables_paginate > .pagination').addClass(' pagination-style-13 pagination-bordered mb-5'); },
            language: {
                infoEmpty: "<span style='color:red'><b>No records found</b></span>"
            },
            processing: true,
            serverSide: true,
            destroy: true,
            autoWidth: false,
            pageLength: 100,
            ajax: {
                type: 'GET',
                url: `${API_URL_ROOT}/albums/datatable/fetch`,
                dataType: 'json',
                headers:{'x-access-token':token},
                complete: function()
                {
                    //$("#loadingScreen").hide();
                    //$('.panel-refresh').click();
                },
                async: true,
                error: function(xhr, error, code)
                {
                    console.log(xhr);
                    console.log(code);
                }
            },
            columnDefs: [
                { orderable: false, targets: [1, 2, 3, 4, 5, 6, 7, 8] }
            ],
            order: [[0, "desc"]],
            columns: [
                {
                    data: 'album_id',
                    render: function (data, type, row, meta) 
                    {
                        return meta.row + meta.settings._iDisplayStart + 1;
                    }
                },
                {
                    data: "album_cover_image",
                    render: function(data, type, row, meta)
                    {
                        var imageURL = `${API_HOST_NAME}/images/albums/${data}`;
                        var imageHTML = `<img src="${imageURL}" class="rounded-circle" alt="Album preview" width="40"/>`;

                        return imageHTML;
                    }
                },
                {data: 'album_title'},
                {data: 'artist_name'},
                {
                    data: 'album_release_date',
                    render: function(data, type, row, meta)
                    {
                        var releaseDate = moment(data).format('MMMM Do YYYY');
                        return releaseDate;
                    }
                },
                {
                    data: 'album_created_at',
                    render: function(data, type, row, meta)
                    {
                        var createdAt = moment.unix(data).format('MMMM Do YYYY, h:mm:ss a');
                        return createdAt;
                    }
                },
                {
                    data: 'feature_status',
                    render: function(data, type, row, meta)
                    {
                        var status = data == "Featured" ? `<span class="badge outline-badge-success">${data}</span>` : `<span class="badge outline-badge-danger">${data}</span>`;
                        return status;
                    }
                },
                {
                    data: 'album_status',
                    render: function(data, type, row, meta)
                    {
                        var status = data == "Published" ? `<span class="badge outline-badge-success">${data}</span>` : `<span class="badge outline-badge-danger">${data}</span>`;
                        return status;
                    }
                },
                {
                    data: 'album_id',
                    render: function(data, type, row, meta)
                    {
                        var actions = `
                            <button class="btn btn-dark mb-2 mr-2 rounded-circle btn-delete" title="Delete Album"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            <button class="btn btn-dark mb-2 mr-2 rounded-circle btn-edit" title="Edit Album" data-toggle="modal" data-target="#editModal"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                        `;

                        return actions;
                    }
                }
            ]  
        });
    }

    //load artists
    function loadArtists()
    {
        blockUI();

        $.ajax({
            type:'GET',
            url: API_URL_ROOT+'/artists',
            dataType: 'json',
            headers:{ 'x-access-token':token},
            success: function(response)
            {
                var artists = response.data;
                var html = '';

                for(var i = 0; i < artists.length; i++)
                {
                    const artist = artists[i];
                    
                    html += `
                        <option value="${artist.artist_id}">${artist.artist_name}</option>
                    `
                }

                $("select.artist_id").append(html);
                $('.selectpicker').selectpicker('refresh');
                unblockUI();
            },
            error:function(req, status, error)
            {
                unblockUI();
                showSimpleMessage("Attention", req.responseJSON.message, "error");
            }
        })
    }
});  