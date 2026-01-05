/**
 * @typedef {Object} Profile
 * @property {string} id - UUID, Primary Key (matches auth.users)
 * @property {string} email
 * @property {string} [full_name]
 * @property {'super_admin' | 'admin' | 'ops_manager' | 'relocation_coordinator' | 'finance' | 'driver' | 'customer'} role
 * @property {string} [phone]
 * @property {string} [whatsapp]
 * @property {string} [avatar_url]
 * @property {Object} [preferences]
 * @property {boolean} is_active
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Entity
 * @property {string} id - UUID
 * @property {string} [profile_id] - Link to Profile
 * @property {string} [code] - Auto-generated (e.g., CUS-001)
 * @property {'individual' | 'corporate' | 'military' | 'government' | 'vet_clinic' | 'airline' | 'freight_forwarder' | 'agent' | 'kennel'} type
 * @property {boolean} is_client
 * @property {boolean} is_vendor
 * @property {string} display_name
 * @property {string} [company_name]
 * @property {string} [tax_id]
 * @property {string} currency
 * @property {Object} [contact_info]
 * @property {Object} [billing_address]
 * @property {Object} [shipping_address]
 * @property {string} [payment_terms]
 * @property {number} credit_limit
 * @property {number} balance_receivable
 * @property {number} balance_payable
 * @property {string} kyc_status
 * @property {Object[]} [kyc_documents]
 * @property {string[]} [tags]
 * @property {boolean} is_vip
 * @property {boolean} is_active
 * @property {string} [created_by]
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} [deleted_at]
 */

/**
 * @typedef {Object} Pet
 * @property {string} id - UUID
 * @property {string} owner_id - Link to Entity
 * @property {string} [code] - Auto-generated (PET-001)
 * @property {string} name
 * @property {number} [species_id]
 * @property {number} [breed_id]
 * @property {string} [date_of_birth]
 * @property {boolean} is_dob_estimated
 * @property {number} [age_years]
 * @property {number} [age_months]
 * @property {'Male' | 'Female' | 'Male_Neutered' | 'Female_Spayed' | 'Unknown'} [gender]
 * @property {number} [weight_kg]
 * @property {string} [microchip_id]
 * @property {string} [passport_number]
 * @property {string[]} [medical_alerts]
 * @property {number} [dims_length_a]
 * @property {number} [dims_height_b]
 * @property {number} [dims_width_c]
 * @property {number} [dims_height_d]
 * @property {string} [calculated_crate_size]
 * @property {Object[]} [photos]
 * @property {boolean} is_active
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} [deleted_at]
 */

/**
 * @typedef {Object} LogisticsNode
 * @property {string} id - UUID
 * @property {'airport' | 'residence' | 'quarantine_station' | 'warehouse' | 'vet_clinic' | 'kennel' | 'port'} [node_type]
 * @property {string} name
 * @property {string} [iata_code]
 * @property {string} [city]
 * @property {number} [country_id]
 * @property {Object} [coordinates] - PostGIS Point
 * @property {Object} [address]
 * @property {string} [timezone]
 * @property {boolean} is_active
 * @property {string} created_at
 */

/**
 * @typedef {Object} Booking
 * @property {string} id - UUID
 * @property {string} [booking_number] - Auto-generated (PP-2025-0001)
 * @property {string} customer_id - Link to Entity
 * @property {string} [agent_id]
 * @property {'enquiry' | 'quoting' | 'quoted' | 'confirmed' | 'payment_pending' | 'docs_prep' | 'docs_pending' | 'docs_received' | 'docs_verified' | 'scheduled' | 'pickup_scheduled' | 'picked_up' | 'in_transit' | 'customs_clearance' | 'cleared' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled' | 'on_hold'} status
 * @property {'export' | 'import' | 'local' | 'domestic' | 'transit'} [service_type]
 * @property {string} [origin_node_id]
 * @property {string} [destination_node_id]
 * @property {string} [scheduled_departure_date]
 * @property {string} currency
 * @property {number} subtotal
 * @property {number} discount_amount
 * @property {number} tax_amount
 * @property {number} total_amount
 * @property {number} paid_amount
 * @property {number} balance_amount
 * @property {string} [coordinator_id]
 * @property {string} [internal_notes]
 * @property {string} [created_by]
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} [deleted_at]
 */

export { }
