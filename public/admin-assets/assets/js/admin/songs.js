$(function () {

    'use strict';

    let token = sessionStorage.getItem('token');

    //quil plugin init
    const quill = new Quill('.editor-container', {
        modules: {
            toolbar: [
                ['image'],
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],

                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                [{ 'direction': 'rtl' }],                         // text direction

                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'font': [] }],
                [{ 'align': [] }],

                ['clean'] 
            ]
        },
        placeholder: 'Song Description...',
        theme: 'snow'  // or 'bubble'
    });
    
    //quil plugin init
    const quill1 = new Quill('.editor-container1', {
        modules: {
            toolbar: [
                ['image'],
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],

                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                [{ 'direction': 'rtl' }],                         // text direction

                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'font': [] }],
                [{ 'align': [] }],

                ['clean'] 
            ]
        },
        placeholder: 'Song Description...',
        theme: 'snow'  // or 'bubble'
    });

	$(document).ready(function(){

        loadSongs();
        loadArtists();
        loadGenres();
        loadAlbums();
        dataTableAlertPrevent('table');

        $('#songs').on('click', '.btn-edit', function(){
            var songID = $(this).parents('tr').attr('id');
            var editModal = $('#editModal');

            //fetch artist details
            $.ajax({
                url: API_URL_ROOT+'/songs/'+songID,
                type: 'GET',
                dataType: 'json',
                headers:{'x-access-token':token},
                success: function(response)
                {
                    if(response.error == false)
                    {
                        var song = response.song;
                        
                        editModal.find('.modal-title').text(song.song_title);
                        editModal.find('.song_title').val(song.song_title);
                        editModal.find('.artist_id').val(song.artist_id);
                        editModal.find('.album_id').val(song.album_id);
                        editModal.find('.genre_id').val(song.genre_id);
                        editModal.find('.feature_status').val(song.feature_status);
                        editModal.find('.song_tags').val(song.song_tags);
                        editModal.find('.song_status').val(song.song_status);
                        editModal.find('.song_id').val(song.song_id);
                        editModal.find('.selectpicker').selectpicker('refresh');

                        quill1.root.innerHTML = song.song_description;
                        editModal.find('.song_tags').tagsinput("refresh");
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

        $('#songs').on('click', '.btn-delete', function(){
            var songID = $(this).parents('tr').attr('id');
            deleteSong(songID);  
        });

        //submit song
        $('#new-song').on('submit', function(e){
            e.preventDefault();
            newSong();
        });

        //edit song
        $('#updateSong').on('submit', function(e){
            e.preventDefault();
            updateSong();
        });
    });

    //internal function to add new Song
    function newSong() 
    {
        swal({
            title: "Attention",
            text: "Are you sure you want to create this Song?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No!"
        }).then(function(result){

            if (result.value) 
            {
                //name vairables
                var form = $('#new-song'); //form
                var avatar = form.find(".cover_image").val(); //media from form
                var audio = form.find(".audio_track").val(); //media from form
                var validFileExtensions = ['jpeg','jpg', 'png'];
                var validAudioExtensions = ['mp3'];
                var description = quill.root.innerHTML;
                var tagsinput = form.find('.song_tags');
                var table = $('#songs').DataTable();
                var fields = form.find('input.required, select.required');  
                //Create array with the file extensions that we wish to upload

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
                var audioExtension = audio.split('.').pop().toLowerCase();

                if($.inArray(extension, validFileExtensions) == -1)
                {
                    //invalid avatar format
                    unblockUI();
                    form.find(".cover_image").focus();
                    showSimpleMessage("Attention", "Avatar must be a jpeg, jpg, png file formats", "error");
                    return false;
                } 
                
                if($.inArray(audioExtension, validAudioExtensions) == -1)
                {
                    //invalid mp3 format
                    unblockUI();
                    form.find(".audio_track").focus();
                    showSimpleMessage("Attention", "Audio file must be an MP3 formated file", "error");
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
                
                if(form.find(".audio_track").get(0).files[0].size > (1024 * 1024 * 15)) 
                {
                    //avatar is more than 15MB
                    unblockUI();
                    form.find(".audio_track").focus();
                    showSimpleMessage("Attention", "Audio file must not be more than 15MB in size", "error");
                    return false;
                } 

                //remove song description
                form.find('input[name="song_description"]').remove();

                // Create a new element input, this will be our description
                $('<input>').attr({type: 'hidden', name: 'song_description', value: description}).appendTo(form);

                $.ajax({
                    type: 'POST',
                    url: API_URL_ROOT+'/songs',
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
                            tagsinput.tagsinput('removeAll');
                            quill.root.innerHTML = '';
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

    //internal function to update song
    function updateSong() 
    {
        swal({
            title: "Attention",
            text: "Are you sure you want to update this song?",
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
                var form = $('#updateSong'); //form
                var avatar = form.find(".cover_image").val();
                var audio = form.find(".audio_track").val();
                var editModal = $('#editModal');
                var songID = form.find('.song_id').val();
                var description = quill1.root.innerHTML;
                var table = $('#songs').DataTable();
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
                
                if(audio)
                {
                    var extension = audio.split('.').pop().toLowerCase();
                    //Create array with the file extensions that we wish to upload
                    var validFileExtensions = ['mp3'];
            
                    if($.inArray(extension, validFileExtensions) == -1)
                    {
                        //invalid avatar format
                        unblockUI();
                        form.find(".audio_track").focus();
                        showSimpleMessage("Attention", "Audio file must be an mp3 file", "error");
                        return false;
                    } 
                    
                    if(form.find(".audio_track").get(0).files[0].size > (1024 * 1024 * 15)) 
                    {
                        //audio is more than 1MB
                        unblockUI();
                        form.find(".audio_track").focus();
                        showSimpleMessage("Attention", "Audio file must not be more than 15MB in size", "error");
                        return false;
                    } 
                }

                //remove previous long desc
                form.find('input[name="song_description"]').remove();

                // Create a new element input, this will be our description
                $('<input>').attr({type: 'hidden', name: 'song_description', value: description}).appendTo(form);

                $.ajax({
                    type: 'PUT',
                    url: `${API_URL_ROOT}/songs/${songID}`,
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
                            form.find(".audio_track").val('');
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

    //internal function to delete song
    function deleteSong(songID) 
    {
        swal({
            title: "Attention",
            text: "Are you sure you want to delete this song?",
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
                var table = $('#songs');
                var rowCount = table.find('tbody tr').length;
                blockUI();         

                $.ajax({
                    type: 'DELETE',
                    url: API_URL_ROOT+'/songs/'+songID,
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
    function loadSongs()
    {
        var table = $('#songs');

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
                url: `${API_URL_ROOT}/songs/datatable/fetch`,
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
                { orderable: false, targets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
            ],
            order: [[0, "desc"]],
            columns: [
                {
                    data: 'song_id',
                    render: function (data, type, row, meta) 
                    {
                        return meta.row + meta.settings._iDisplayStart + 1;
                    }
                },
                {
                    data: "song_cover_image",
                    render: function(data, type, row, meta)
                    {
                        var imageURL = `${API_HOST_NAME}/images/songs/${data}`;
                        var imageHTML = `<img src="${imageURL}" class="rounded-circle" alt="Song preview" width="40"/>`;

                        return imageHTML;
                    }
                },
                {data: 'song_title'},
                {data: 'album_title'},
                {data: 'genre_name'},
                {data: 'artist_name'},
                {data: 'song_tags'},
                {
                    data: 'song_created_at',
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
                    data: 'song_status',
                    render: function(data, type, row, meta)
                    {
                        var status = data == "Published" ? `<span class="badge outline-badge-success">${data}</span>` : `<span class="badge outline-badge-danger">${data}</span>`;
                        return status;
                    }
                },
                {
                    data: 'song_id',
                    render: function(data, type, row, meta)
                    {
                        var actions = `
                            <button class="btn btn-dark mb-2 mr-2 rounded-circle btn-delete" title="Delete Video"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            <button class="btn btn-dark mb-2 mr-2 rounded-circle btn-edit" title="Edit Video" data-toggle="modal" data-target="#editModal"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
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
    
    //load albums
    function loadAlbums()
    {
        blockUI();

        $.ajax({
            type:'GET',
            url: API_URL_ROOT+'/albums',
            dataType: 'json',
            headers:{ 'x-access-token':token},
            success: function(response)
            {
                var albums = response.data;
                var html = '';

                for(var i = 0; i < albums.length; i++)
                {
                    const album = albums[i];
                    
                    html += `
                        <option value="${album.album_id}">${album.album_title}</option>
                    `
                }

                $("select.album_id").append(html);
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
    
    //load genres
    function loadGenres()
    {
        blockUI();

        $.ajax({
            type:'GET',
            url: API_URL_ROOT+'/genres',
            dataType: 'json',
            headers:{ 'x-access-token':token},
            success: function(response)
            {
                var genres = response.data;
                var html = '';

                for(var i = 0; i < genres.length; i++)
                {
                    const genre = genres[i];
                    
                    html += `
                        <option value="${genre.genre_id}">${genre.genre_name}</option>
                    `
                }

                $("select.genre_id").append(html);
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