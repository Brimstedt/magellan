/* eslint no-undef: 0, no-unused-expressions: 0 */
"use strict";
var expect = require("chai").expect;
var hostedProfile = require("../src/hosted_profiles");

describe("hostedProfiles", function () {
  it("should return the #fragment from a URL", function () {
    expect(hostedProfile.getProfileNameFromURL("http://example.com/#boo")).to.eql("boo");
  });

  it("should return undefined for a URL wihtout fragments", function () {
    expect(hostedProfile.getProfileNameFromURL("http://example.com/")).to.be.undefined;
  });

  it("should return undefined for an invalid URL", function () {
    expect(hostedProfile.getProfileNameFromURL("👍")).to.be.undefined;
  });

  it("should hit URLs", function () {
    expect(hostedProfile.getProfilesAtURL("http://foozbaz.com", {
      syncRequest: function () {
        return {
          getBody: function () {
            return JSON.stringify({
              profiles: "foo"
            });
          }
        };
      }
    })).to.eql({profiles: "foo"});
  });

  it("should check for malformed responses", function () {
    try {
      hostedProfile.getProfilesAtURL("http://foozbaz.com", {
        syncRequest: function () {
          return {
            getBody: function () {
              return JSON.stringify({});
            }
          };
        }
      });
    } catch (e) {
      expect(e.message).to.eql("Profiles supplied at http://foozbaz.com are malformed.");
    }
  });

  it("should check for malformed responses", function () {
    try {
      hostedProfile.getProfilesAtURL("http://foozbaz.com", {
        syncRequest: function () {
          return {
            getBody: function () {
              return {};
            }
          };
        }
      });
    } catch (e) {
      expect(e.message).to.eql("Could not fetch profiles from http://foozbaz.com");
    }
  });
});
