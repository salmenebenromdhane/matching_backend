function Company(source_id,name,website,email,phone,address,postal_code,city,country,source_name) { 
    this.source_id  = source_id  || null;
    this.source_name = source_name || null;
    this.name  = name  || null;
    this.website = website || null;
    this.email  = email  || null;
    this.phone = phone || null;
    this.address  = address  || null;
    this.postal_code  = postal_code  || null;
    this.city  = city  || null;
    this.country  = country  || null;
}

module.exports = Company;