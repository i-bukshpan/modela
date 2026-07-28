CREATE OR REPLACE FUNCTION increment_product_view(p_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE products SET view_count = view_count + 1 WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_blog_view(b_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE blog_posts SET view_count = view_count + 1 WHERE id = b_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_product_like(p_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE products SET like_count = like_count + 1 WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_product_like(p_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE products SET like_count = like_count - 1 WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_file_download(f_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE product_files SET downloads = downloads + 1 WHERE id = f_id;
END;
$$ LANGUAGE plpgsql;
