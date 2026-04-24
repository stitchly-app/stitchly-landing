-- Delete all objects from the videos bucket
DELETE FROM storage.objects 
WHERE bucket_id = 'videos';