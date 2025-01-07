const db = require("../models/db");


const getCategories = async (req, res) => {
  const { search } = req.query;
  const query = `
    SELECT 
        c.cat_id,
        c.cat_name_en,
        c.cat_icon,
        c.no_of_dua AS category_no_of_dua,
        c.no_of_subcat,
        s.subcat_id,
        s.subcat_name_en,
        s.no_of_dua AS subcategory_no_of_dua,
        GROUP_CONCAT(d.dua_id) AS dua_ids,
        GROUP_CONCAT(d.dua_name_en) AS dua_names
    FROM 
        category c
    LEFT JOIN 
        sub_category s ON c.cat_id = s.cat_id
    LEFT JOIN 
        dua d ON s.subcat_id = d.subcat_id AND s.cat_id = d.cat_id AND d.dua_name_en IS NOT NULL
    ${search ? "WHERE c.cat_name_en LIKE ?" : ""}
    GROUP BY 
        c.cat_id, s.subcat_id;
  `;
  const params = search ? [`%${search}%`] : [];
  try {
    db.all(query, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const categories = rows.reduce((result, row) => {
        let category = result.find((cat) => cat.cat_id === row.cat_id);
        if (!category) {
          category = {
            cat_id: row.cat_id,
            cat_name_en: row.cat_name_en,
            cat_icon: row.cat_icon,
            no_of_dua: row.category_no_of_dua,
            no_of_subcat: row.no_of_subcat,
            sub_categories: [],
          };
          result.push(category);
        }
        if (row.subcat_id) {
          const subcategory = {
            subcat_id: row.subcat_id,
            subcat_name_en: row.subcat_name_en,
            no_of_dua: row.subcategory_no_of_dua,
            duas: row.dua_ids
              ? row.dua_ids.split(",").map((id, index) => ({
                  dua_id: id,
                  dua_name_en: row.dua_names.split(",")[index],
                }))
              : [],
          };
          category.sub_categories.push(subcategory);
        }

        return result;
      }, []);

      res.json(categories);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDuaById, getCategories };
